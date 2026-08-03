from __future__ import annotations

import os
import shutil
import tempfile
from pathlib import Path
from typing import List

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pypdf import PdfReader, PdfWriter
from starlette.background import BackgroundTask

VERSION = "2.0.0"
MAX_FILE_BYTES = int(os.getenv("MAX_FILE_BYTES", str(50 * 1024 * 1024)))
MAX_TOTAL_BYTES = int(os.getenv("MAX_TOTAL_BYTES", str(200 * 1024 * 1024)))
MAX_FILES = int(os.getenv("MAX_FILES", "20"))
ALLOWED_ORIGINS = [
    item.strip()
    for item in os.getenv(
        "ALLOWED_ORIGINS",
        "https://ajnpdf.com,https://www.ajnpdf.com,http://localhost:9002",
    ).split(",")
    if item.strip()
]

app = FastAPI(title="AJN PDF API", version=VERSION)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["authorization", "content-type"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "version": VERSION}


@app.get("/version")
async def version():
    return {"version": VERSION}


async def save_pdf(upload: UploadFile, destination: Path) -> int:
    total = 0
    first_chunk = True

    with destination.open("wb") as output:
        while chunk := await upload.read(1024 * 1024):
            if first_chunk:
                first_chunk = False
                if not chunk.startswith(b"%PDF-"):
                    raise HTTPException(status_code=400, detail="Uploaded content is not a PDF.")
            total += len(chunk)
            if total > MAX_FILE_BYTES:
                raise HTTPException(status_code=413, detail="A PDF exceeds the per-file limit.")
            output.write(chunk)

    if total == 0:
        raise HTTPException(status_code=400, detail="An uploaded PDF is empty.")
    return total


@app.post("/api/pdf/merge")
async def merge_pdfs(files: List[UploadFile] = File(...)):
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="Select at least two PDF files.")
    if len(files) > MAX_FILES:
        raise HTTPException(status_code=413, detail=f"Maximum {MAX_FILES} files are allowed.")

    work_dir = Path(tempfile.mkdtemp(prefix="ajn-pdf-"))
    writer = PdfWriter()
    total_bytes = 0

    try:
        for index, upload in enumerate(files):
            source = work_dir / f"input-{index}.pdf"
            total_bytes += await save_pdf(upload, source)
            if total_bytes > MAX_TOTAL_BYTES:
                raise HTTPException(status_code=413, detail="Combined upload exceeds the request limit.")

            reader = PdfReader(str(source), strict=False)
            if reader.is_encrypted:
                raise HTTPException(status_code=400, detail="Unlock encrypted PDFs first.")
            for page in reader.pages:
                writer.add_page(page)

        result = work_dir / "AJN-PDF-merged.pdf"
        with result.open("wb") as output:
            writer.write(output)

        return FileResponse(
            result,
            media_type="application/pdf",
            filename="AJN-PDF-merged.pdf",
            background=BackgroundTask(shutil.rmtree, work_dir, ignore_errors=True),
        )
    except HTTPException:
        shutil.rmtree(work_dir, ignore_errors=True)
        raise
    except Exception:
        shutil.rmtree(work_dir, ignore_errors=True)
        raise HTTPException(status_code=422, detail="The PDFs could not be merged.")
    finally:
        for upload in files:
            await upload.close()
