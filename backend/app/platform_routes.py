from __future__ import annotations

import asyncio
import json
import tempfile
import time
from pathlib import Path
from typing import Annotated, Any

from fastapi import APIRouter, File, Form, Header, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse, Response

from .api_access import APIAccessError, APIPrincipal, APIRateState, authenticate_api_key, configuration_status, enforce_api_rate_limit
from .conversion_engine import list_backend_tools, validate_input_file


router = APIRouter()
_OCR_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff", ".gif", ".heic", ".heif"}


def _api_error(exc: APIAccessError) -> HTTPException:
    headers = {"X-AJN-API-Error-Code": exc.code}
    if exc.status_code == 401:
        headers["WWW-Authenticate"] = 'ApiKey realm="AJN PDF API"'
    return HTTPException(status_code=exc.status_code, detail=exc.message, headers=headers)


async def _guard(raw_key: str | None, scope: str) -> tuple[APIPrincipal, APIRateState]:
    try:
        principal = authenticate_api_key(raw_key, scope)
        state = await enforce_api_rate_limit(principal)
        return principal, state
    except APIAccessError as exc:
        raise _api_error(exc) from exc


def _api_headers(principal: APIPrincipal, rate: APIRateState) -> dict[str, str]:
    return {
        "X-AJN-API-Key-ID": principal.key_id,
        "X-RateLimit-Limit": str(rate.limit),
        "X-RateLimit-Remaining": str(rate.remaining),
        "X-RateLimit-Reset": str(rate.reset_seconds),
        "Cache-Control": "no-store",
    }


def _apply_api_headers(response: Response, principal: APIPrincipal, rate: APIRateState) -> Response:
    for name, value in _api_headers(principal, rate).items():
        response.headers[name] = value
    return response


def _parse_options(raw: str) -> dict[str, Any]:
    try:
        value = json.loads(raw or "{}")
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="Options must be valid JSON.") from exc
    if not isinstance(value, dict):
        raise HTTPException(status_code=400, detail="Options must be a JSON object.")
    return value


async def _run_ocr_analysis(file: UploadFile, options: dict[str, Any]) -> JSONResponse:
    # Import lazily to reuse the exact same upload limits, worker isolation, timeout,
    # disk checks and error mapping as the main AJN conversion route without a cycle.
    from . import main as main_api

    suffix = Path(file.filename or "document.bin").suffix.lower()
    if suffix not in _OCR_EXTENSIONS:
        await file.close()
        raise HTTPException(status_code=415, detail="OCR analysis accepts PDF, JPG, PNG, WebP, BMP, TIFF, GIF or HEIC/HEIF files.")

    temporary = tempfile.TemporaryDirectory(prefix="ajn-ocr-analysis-")
    workdir = Path(temporary.name)
    source = workdir / f"input{suffix}"
    output = workdir / "ocr-layout.json"
    started = time.perf_counter()
    try:
        size = await main_api._save_upload(file, source)
        try:
            validate_input_file(source)
        except ValueError as exc:
            raise HTTPException(status_code=415, detail=str(exc)) from exc
        main_api._ensure_job_disk(size)
        async with main_api._PROCESSING_SEMAPHORE:
            await asyncio.to_thread(
                main_api._run_worker_job,
                {
                    "operation": "ocr_analyze",
                    "files": [str(source)],
                    "output": str(output),
                    "workdir": str(workdir),
                    "options": options,
                },
                main_api.PROCESSING_TIMEOUT_SECONDS,
            )
        if not output.exists() or output.stat().st_size <= 2:
            raise HTTPException(status_code=422, detail="OCR analysis did not produce a valid result.")
        if output.stat().st_size > 32 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="OCR analysis output is too large. Analyze fewer pages at a time.")
        try:
            payload = json.loads(output.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            raise HTTPException(status_code=422, detail="OCR analysis returned invalid layout data.") from exc
        duration_ms = round((time.perf_counter() - started) * 1000)
        return JSONResponse(
            payload,
            headers={
                "X-AJN-Temporary-Processing": "true",
                "X-AJN-Worker-Isolation": "process",
                "X-AJN-OCR-Duration-MS": str(duration_ms),
                "Cache-Control": "no-store",
            },
        )
    except TimeoutError as exc:
        raise HTTPException(status_code=504, detail="OCR analysis timed out. Try fewer pages or a lower DPI.") from exc
    except main_api.WorkerJobError as exc:
        raise main_api._worker_http_error(exc) from exc
    finally:
        temporary.cleanup()


@router.get("/api/v1/status")
def api_v1_status():
    status = configuration_status()
    return {
        "service": "AJN PDF Public API",
        "version": "v1",
        "enabled": status["enabled"],
        "configured_keys": status["configured_keys"],
        "configuration_valid": status["configuration_valid"],
        "authentication": status["authentication"],
        "supported_scopes": status["supported_scopes"],
    }


@router.get("/api/v1/account")
async def api_v1_account(
    x_ajn_api_key: Annotated[str | None, Header(alias="X-AJN-API-Key")] = None,
):
    principal, rate = await _guard(x_ajn_api_key, "read")
    return JSONResponse(
        {
            "key_id": principal.key_id,
            "scopes": sorted(principal.scopes),
            "rate_per_minute": principal.rate_per_minute,
            "remaining_this_window": rate.remaining,
        },
        headers=_api_headers(principal, rate),
    )


@router.get("/api/v1/capabilities")
async def api_v1_capabilities(
    x_ajn_api_key: Annotated[str | None, Header(alias="X-AJN-API-Key")] = None,
):
    principal, rate = await _guard(x_ajn_api_key, "read")
    tools = list_backend_tools()
    return JSONResponse(
        {
            "version": "v1",
            "tools": tools,
            "available": sum(1 for tool in tools if bool(tool.get("available"))),
            "total": len(tools),
            "ocr_analysis": {
                "languages": ["eng", "tel", "hin", "tam", "kan", "mal"],
                "combined_languages": True,
                "layout_json": True,
                "word_confidence": True,
                "bounding_boxes": True,
                "page_ranges": True,
            },
        },
        headers=_api_headers(principal, rate),
    )


@router.post("/api/v1/convert/{tool_id}")
async def api_v1_convert(
    request: Request,
    tool_id: str,
    files: Annotated[list[UploadFile] | None, File()] = None,
    options_json: Annotated[str, Form(max_length=20000)] = "{}",
    output_name: Annotated[str, Form(max_length=120)] = "",
    source_url: Annotated[str, Form(max_length=2048)] = "",
    x_ajn_api_key: Annotated[str | None, Header(alias="X-AJN-API-Key")] = None,
):
    del request
    principal, rate = await _guard(x_ajn_api_key, "convert")
    from .main import convert_file
    response = await convert_file(tool_id, files, options_json, output_name, source_url)
    return _apply_api_headers(response, principal, rate)


@router.post("/api/ocr/analyze")
async def website_ocr_analyze(
    file: Annotated[UploadFile, File(...)],
    options_json: Annotated[str, Form(max_length=20000)] = "{}",
):
    return await _run_ocr_analysis(file, _parse_options(options_json))


@router.post("/api/v1/ocr/analyze")
async def api_v1_ocr_analyze(
    file: Annotated[UploadFile, File(...)],
    options_json: Annotated[str, Form(max_length=20000)] = "{}",
    x_ajn_api_key: Annotated[str | None, Header(alias="X-AJN-API-Key")] = None,
):
    principal, rate = await _guard(x_ajn_api_key, "ocr")
    response = await _run_ocr_analysis(file, _parse_options(options_json))
    return _apply_api_headers(response, principal, rate)


@router.post("/api/v1/ocr/text")
async def api_v1_ocr_text(
    file: Annotated[UploadFile, File(...)],
    language: Annotated[str, Form(max_length=64)] = "eng",
    dpi: Annotated[int, Form(ge=150, le=400)] = 240,
    pages: Annotated[str, Form(max_length=500)] = "all",
    output_name: Annotated[str, Form(max_length=120)] = "ocr-text",
    x_ajn_api_key: Annotated[str | None, Header(alias="X-AJN-API-Key")] = None,
):
    principal, rate = await _guard(x_ajn_api_key, "ocr")
    from .main import convert_file
    suffix = Path(file.filename or "").suffix.lower()
    tool_id = "scanned-pdf-to-text" if suffix == ".pdf" else "image-to-text"
    options = json.dumps({"language": language, "dpi": dpi, "pages": pages, "auto_rotate": True, "deskew": True, "denoise": True, "contrast": 1.35})
    response = await convert_file(tool_id, [file], options, output_name, "")
    return _apply_api_headers(response, principal, rate)


@router.post("/api/v1/ocr/searchable-pdf")
async def api_v1_ocr_searchable_pdf(
    file: Annotated[UploadFile, File(...)],
    language: Annotated[str, Form(max_length=64)] = "eng",
    dpi: Annotated[int, Form(ge=150, le=400)] = 240,
    output_name: Annotated[str, Form(max_length=120)] = "searchable",
    x_ajn_api_key: Annotated[str | None, Header(alias="X-AJN-API-Key")] = None,
):
    principal, rate = await _guard(x_ajn_api_key, "ocr")
    from .main import convert_file
    suffix = Path(file.filename or "").suffix.lower()
    tool_id = "scanned-pdf-to-searchable-pdf" if suffix == ".pdf" else "image-to-searchable-pdf"
    options = json.dumps({"language": language, "dpi": dpi, "auto_rotate": True, "deskew": True, "denoise": True, "contrast": 1.35})
    response = await convert_file(tool_id, [file], options, output_name, "")
    return _apply_api_headers(response, principal, rate)
