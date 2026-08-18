from __future__ import annotations

import asyncio
import base64
import binascii
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any

from mcp.server import MCPServer
from mcp.server.transport_security import TransportSecuritySettings

from .conversion_engine import (
    SPECS,
    list_backend_tools,
    tool_available,
    validate_input_files,
    validate_output_file,
)

MCP_VERSION = "1.0.0"
MCP_MAX_FILE_BYTES = max(1, int(os.getenv("AJN_MCP_MAX_FILE_MB", "8"))) * 1024 * 1024
MCP_MAX_TOTAL_BYTES = max(1, int(os.getenv("AJN_MCP_MAX_TOTAL_MB", "16"))) * 1024 * 1024
MCP_MAX_OUTPUT_BYTES = max(1, int(os.getenv("AJN_MCP_MAX_OUTPUT_MB", "16"))) * 1024 * 1024
MCP_TIMEOUT_SECONDS = max(15, int(os.getenv("AJN_MCP_PROCESSING_TIMEOUT_SECONDS", "180")))


def _csv_env(name: str, default: str) -> list[str]:
    return [value.strip() for value in os.getenv(name, default).split(",") if value.strip()]


_allowed_host_names = _csv_env(
    "AJN_MCP_ALLOWED_HOSTS",
    "localhost,127.0.0.1,ajnpdf.com,www.ajnpdf.com",
)
MCP_ALLOWED_HOSTS = sorted(
    {
        item
        for host in _allowed_host_names
        for item in (host, host if ":" in host or host.endswith(":*") else f"{host}:*")
    }
)
MCP_ALLOWED_ORIGINS = _csv_env(
    "AJN_MCP_ALLOWED_ORIGINS",
    "https://ajnpdf.com,https://www.ajnpdf.com,http://localhost:3000,http://localhost:9002",
)

mcp = MCPServer("AJN PDF")


def _spec_payload(tool_id: str) -> dict[str, Any]:
    spec = SPECS.get(tool_id)
    if spec is None:
        raise ValueError(f"Unknown AJN PDF conversion tool: {tool_id}")
    available, reason = tool_available(spec)
    return {
        "tool_id": spec.tool_id,
        "name": spec.name,
        "category": spec.category,
        "input_extensions": list(spec.input_extensions),
        "output_extension": spec.output_extension,
        "output_mime": spec.output_mime,
        "multi_file": spec.multi_file,
        "available": available,
        "unavailable_reason": reason,
        "limitation": spec.limitation,
    }


def _safe_filename(value: str, fallback: str = "input.bin") -> str:
    name = Path(value or fallback).name.strip()
    cleaned = "".join(ch if ch.isalnum() or ch in "._- " else "_" for ch in name)
    return (cleaned[:120] or fallback).rstrip(".")


def _decode_file(filename: str, content_base64: str) -> tuple[str, bytes]:
    safe_name = _safe_filename(filename)
    try:
        payload = base64.b64decode(content_base64, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise ValueError(f"{safe_name}: content_base64 is not valid base64.") from exc
    if not payload:
        raise ValueError(f"{safe_name}: file is empty.")
    if len(payload) > MCP_MAX_FILE_BYTES:
        raise ValueError(
            f"{safe_name}: file exceeds the MCP inline limit of {MCP_MAX_FILE_BYTES // 1024 // 1024} MB. "
            "Use the AJN PDF web/API workflow for larger files."
        )
    return safe_name, payload


def _parse_options(options_json: str) -> dict[str, Any]:
    try:
        value = json.loads(options_json or "{}")
    except json.JSONDecodeError as exc:
        raise ValueError("options_json must be valid JSON.") from exc
    if not isinstance(value, dict):
        raise ValueError("options_json must contain a JSON object.")
    return value


def _worker_root() -> Path:
    return Path(__file__).resolve().parents[1]


def _run_worker(payload: dict[str, Any]) -> None:
    process = subprocess.run(
        [sys.executable, "-m", "app.job_worker"],
        cwd=str(_worker_root()),
        input=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=MCP_TIMEOUT_SECONDS,
        check=False,
    )
    response: dict[str, Any] = {}
    if process.stdout:
        try:
            parsed = json.loads(process.stdout.decode("utf-8", errors="replace"))
            if isinstance(parsed, dict):
                response = parsed
        except json.JSONDecodeError:
            response = {}
    if process.returncode != 0 or response.get("ok") is not True:
        message = str(response.get("message") or "").strip()
        if not message:
            message = process.stderr.decode("utf-8", errors="replace")[-800:].strip()
        raise RuntimeError(message or "AJN PDF processing worker failed.")


def _encode_result(path: Path, tool_id: str, mime_type: str) -> dict[str, Any]:
    if not path.exists() or not path.is_file():
        raise RuntimeError("AJN PDF did not create an output file.")
    size = path.stat().st_size
    if size <= 0:
        raise RuntimeError("AJN PDF created an empty output file.")
    if size > MCP_MAX_OUTPUT_BYTES:
        raise ValueError(
            f"The result is {round(size / 1024 / 1024, 2)} MB, which exceeds the MCP inline result limit of "
            f"{MCP_MAX_OUTPUT_BYTES // 1024 // 1024} MB. Use ajnpdf.com or the REST API for this job."
        )
    return {
        "ok": True,
        "tool_id": tool_id,
        "filename": path.name,
        "mime_type": mime_type,
        "size_bytes": size,
        "content_base64": base64.b64encode(path.read_bytes()).decode("ascii"),
        "encoding": "base64",
        "temporary_processing": True,
    }


async def _convert(
    tool_id: str,
    files: list[dict[str, str]],
    options_json: str = "{}",
    output_name: str = "",
    source_url: str = "",
) -> dict[str, Any]:
    spec = SPECS.get(tool_id)
    if spec is None:
        raise ValueError(f"Unknown AJN PDF conversion tool: {tool_id}")
    available, reason = tool_available(spec)
    if not available:
        raise RuntimeError(reason or f"{spec.name} is unavailable on this AJN PDF server.")
    if not files and spec.processor != "url_to_pdf":
        raise ValueError("This conversion requires at least one input file.")
    if not spec.multi_file and len(files) > 1:
        raise ValueError(f"{spec.name} accepts one source file at a time.")

    options = _parse_options(options_json)
    decoded = [_decode_file(item.get("filename", ""), item.get("content_base64", "")) for item in files]
    total_bytes = sum(len(payload) for _, payload in decoded)
    if total_bytes > MCP_MAX_TOTAL_BYTES:
        raise ValueError(
            f"Combined input exceeds the MCP inline limit of {MCP_MAX_TOTAL_BYTES // 1024 // 1024} MB."
        )

    with tempfile.TemporaryDirectory(prefix=f"ajn-mcp-{tool_id[:24]}-") as temp_dir:
        workdir = Path(temp_dir)
        paths: list[Path] = []
        for index, (filename, payload) in enumerate(decoded, start=1):
            source = workdir / f"input-{index:03d}{Path(filename).suffix.lower()}"
            source.write_bytes(payload)
            paths.append(source)

        validate_input_files(spec, paths)
        base_name = _safe_filename(output_name or spec.tool_id, spec.tool_id)
        stem = Path(base_name).stem or spec.tool_id
        target = workdir / f"{stem}{spec.output_extension}"
        worker_payload = {
            "operation": "conversion",
            "tool_id": tool_id,
            "files": [str(path) for path in paths],
            "output": str(target),
            "workdir": str(workdir),
            "options": options,
            "source_url": source_url or None,
        }
        try:
            await asyncio.to_thread(_run_worker, worker_payload)
        except subprocess.TimeoutExpired as exc:
            raise TimeoutError(f"{spec.name} exceeded the MCP processing timeout.") from exc
        validate_output_file(target, spec.output_extension)
        return _encode_result(target, tool_id, spec.output_mime)


async def _special_pdf_operation(operation: str, filename: str, content_base64: str, **kwargs: Any) -> dict[str, Any]:
    safe_name, payload = _decode_file(filename, content_base64)
    if not payload.startswith(b"%PDF-"):
        raise ValueError("The supplied file is not a PDF.")
    with tempfile.TemporaryDirectory(prefix=f"ajn-mcp-{operation}-") as temp_dir:
        workdir = Path(temp_dir)
        source = workdir / "input.pdf"
        target = workdir / "output.pdf"
        source.write_bytes(payload)
        worker_payload: dict[str, Any] = {
            "operation": operation,
            "source": str(source),
            "target": str(target),
            **kwargs,
        }
        try:
            await asyncio.to_thread(_run_worker, worker_payload)
        except subprocess.TimeoutExpired as exc:
            raise TimeoutError(f"PDF {operation} exceeded the MCP processing timeout.") from exc
        return _encode_result(target, f"pdf-{operation}", "application/pdf") | {"source_filename": safe_name}


@mcp.tool()
def list_ajn_pdf_tools(query: str = "", category: str = "", available_only: bool = True) -> dict[str, Any]:
    """List AJN PDF conversion/OCR/image/document tools. Use this before conversion when the exact tool_id is unknown."""
    query_text = query.strip().lower()
    category_text = category.strip().lower()
    tools: list[dict[str, Any]] = []
    for item in list_backend_tools():
        tool_id = str(item.get("tool_id") or item.get("id") or "")
        if not tool_id or tool_id not in SPECS:
            continue
        payload = _spec_payload(tool_id)
        haystack = f"{payload['tool_id']} {payload['name']} {payload['category']}".lower()
        if query_text and query_text not in haystack:
            continue
        if category_text and category_text != str(payload["category"]).lower():
            continue
        if available_only and not payload["available"]:
            continue
        tools.append(payload)
    return {"version": MCP_VERSION, "count": len(tools), "tools": tools}


@mcp.tool()
def get_ajn_pdf_tool(tool_id: str) -> dict[str, Any]:
    """Get the exact inputs, output type, availability, and limitations for one AJN PDF conversion tool."""
    return _spec_payload(tool_id.strip())


@mcp.tool()
async def convert_ajn_pdf_file(
    tool_id: str,
    filename: str,
    content_base64: str,
    options_json: str = "{}",
    output_name: str = "",
) -> dict[str, Any]:
    """Convert one small inline file with an AJN PDF conversion tool. content_base64 must contain the file bytes encoded as base64."""
    return await _convert(
        tool_id=tool_id.strip(),
        files=[{"filename": filename, "content_base64": content_base64}],
        options_json=options_json,
        output_name=output_name,
    )


@mcp.tool()
async def convert_ajn_pdf_files(
    tool_id: str,
    files: list[dict[str, str]],
    options_json: str = "{}",
    output_name: str = "",
) -> dict[str, Any]:
    """Convert multiple small inline files for AJN PDF tools that support batches, such as image-to-PDF. Each item needs filename and content_base64."""
    return await _convert(
        tool_id=tool_id.strip(),
        files=files,
        options_json=options_json,
        output_name=output_name,
    )


@mcp.tool()
async def ajn_url_to_pdf(url: str, output_name: str = "web-page") -> dict[str, Any]:
    """Create a readable PDF from a public HTTP/HTTPS web page using AJN PDF's URL-to-PDF safety checks."""
    return await _convert(
        tool_id="url-to-pdf",
        files=[],
        options_json="{}",
        output_name=output_name,
        source_url=url.strip(),
    )


@mcp.tool()
async def protect_ajn_pdf(
    filename: str,
    content_base64: str,
    user_password: str,
    owner_password: str = "",
    allow_printing: bool = True,
    allow_copying: bool = False,
    allow_editing: bool = False,
    allow_annotations: bool = False,
    allow_form_filling: bool = True,
) -> dict[str, Any]:
    """Password-protect a small PDF with AJN PDF and return the protected PDF as base64."""
    if len(user_password) < 4 or len(user_password) > 128:
        raise ValueError("user_password must contain 4 to 128 characters.")
    owner = owner_password or base64.urlsafe_b64encode(os.urandom(24)).decode("ascii").rstrip("=")
    permissions = {
        "accessibility": True,
        "extract": allow_copying,
        "modify_annotation": allow_annotations,
        "modify_assembly": allow_editing,
        "modify_form": allow_form_filling,
        "modify_other": allow_editing,
        "print_lowres": allow_printing,
        "print_highres": allow_printing,
    }
    return await _special_pdf_operation(
        "protect",
        filename,
        content_base64,
        user_password=user_password,
        owner_password=owner,
        permissions=permissions,
    )


@mcp.tool()
async def unlock_ajn_pdf(filename: str, content_base64: str, password: str) -> dict[str, Any]:
    """Unlock a password-protected small PDF when the user supplies the correct password."""
    return await _special_pdf_operation("unlock", filename, content_base64, password=password)


@mcp.tool()
async def repair_ajn_pdf(filename: str, content_base64: str) -> dict[str, Any]:
    """Repair/rewrite a damaged or structurally problematic small PDF using AJN PDF's repair worker."""
    return await _special_pdf_operation("repair", filename, content_base64)


security = TransportSecuritySettings(
    allowed_hosts=MCP_ALLOWED_HOSTS,
    allowed_origins=MCP_ALLOWED_ORIGINS,
)

# Standalone ASGI application. The official SDK owns the MCP session-manager
# lifespan when this app is served directly (for example with uvicorn).
app = mcp.streamable_http_app(transport_security=security)
