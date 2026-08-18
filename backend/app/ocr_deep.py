from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Iterable

import fitz
import pytesseract
from PIL import Image
from pytesseract import Output

from . import conversion_engine as legacy
from .processing_quality import _iter_input_frames, _prepare_ocr_image, _render_page


MAX_OCR_WORDS = 200_000
MAX_OCR_JSON_BYTES = 32 * 1024 * 1024


def _language(options: dict[str, Any]) -> str:
    requested = str(options.get("language", "eng")).strip() or "eng"
    installed = set(legacy.available_ocr_languages())
    if not installed:
        raise RuntimeError("Tesseract OCR language data is unavailable on the processing server.")
    parts = [item for item in requested.split("+") if item]
    if not parts:
        parts = ["eng"]
    missing = sorted(set(parts).difference(installed))
    if missing:
        raise ValueError(f"OCR language data is not installed: {', '.join(missing)}")
    return "+".join(parts)


def _parse_pages(value: object, total: int) -> list[int]:
    raw = str(value or "all").strip().lower()
    if raw in {"", "all", "*"}:
        return list(range(1, total + 1))
    selected: set[int] = set()
    for part in raw.split(","):
        token = part.strip()
        if not token:
            continue
        match = re.fullmatch(r"(\d+)(?:\s*-\s*(\d+))?", token)
        if not match:
            raise ValueError("OCR pages must look like all, 2, 1-3, or 1,4,7-9.")
        start = int(match.group(1))
        end = int(match.group(2) or start)
        if start < 1 or end < start or end > total:
            raise ValueError(f"OCR page range {token} is outside 1-{total}.")
        selected.update(range(start, end + 1))
    if not selected:
        raise ValueError("Select at least one OCR page.")
    return sorted(selected)


def _osd(image: Image.Image) -> dict[str, Any]:
    try:
        data = pytesseract.image_to_osd(image, output_type=Output.DICT)
        return {
            "orientation_degrees": int(data.get("orientation") or 0),
            "rotate_degrees": int(data.get("rotate") or 0),
            "orientation_confidence": round(float(data.get("orientation_conf") or 0), 2),
            "script": str(data.get("script") or "unknown"),
            "script_confidence": round(float(data.get("script_conf") or 0), 2),
        }
    except Exception:
        return {
            "orientation_degrees": 0,
            "rotate_degrees": 0,
            "orientation_confidence": 0.0,
            "script": "unknown",
            "script_confidence": 0.0,
        }


def _analyze_image(image: Image.Image, options: dict[str, Any], page_number: int, language: str) -> dict[str, Any]:
    executable = legacy.command_path("tesseract")
    if not executable:
        raise RuntimeError("Tesseract OCR is unavailable on the processing server.")
    pytesseract.pytesseract.tesseract_cmd = executable

    prepared = _prepare_ocr_image(image, options)
    try:
        psm = max(3, min(13, int(options.get("psm", 3))))
        config = f"--oem 1 --psm {psm} -c preserve_interword_spaces=1"
        data = pytesseract.image_to_data(prepared, lang=language, config=config, output_type=Output.DICT)
        orientation = _osd(prepared)
        min_word_confidence = max(-1.0, min(100.0, float(options.get("min_word_confidence", 0))))
        words: list[dict[str, Any]] = []
        line_map: dict[tuple[int, int, int], list[dict[str, Any]]] = {}
        confidences: list[float] = []
        texts = data.get("text", [])
        for index, raw_text in enumerate(texts):
            text = str(raw_text or "").strip()
            if not text:
                continue
            try:
                confidence = float(data.get("conf", ["-1"])[index])
            except Exception:
                confidence = -1.0
            if confidence >= 0:
                confidences.append(confidence)
            if confidence >= 0 and confidence < min_word_confidence:
                continue
            left = int(data.get("left", [0])[index] or 0)
            top = int(data.get("top", [0])[index] or 0)
            width = int(data.get("width", [0])[index] or 0)
            height = int(data.get("height", [0])[index] or 0)
            block_num = int(data.get("block_num", [0])[index] or 0)
            par_num = int(data.get("par_num", [0])[index] or 0)
            line_num = int(data.get("line_num", [0])[index] or 0)
            word_num = int(data.get("word_num", [0])[index] or 0)
            word = {
                "text": text,
                "confidence": round(confidence, 1),
                "bbox": {"x": left, "y": top, "width": width, "height": height},
                "block": block_num,
                "paragraph": par_num,
                "line": line_num,
                "word": word_num,
            }
            words.append(word)
            line_map.setdefault((block_num, par_num, line_num), []).append(word)
            if len(words) > MAX_OCR_WORDS:
                raise ValueError(f"OCR produced too many words for one analysis job. Maximum: {MAX_OCR_WORDS}.")

        lines: list[dict[str, Any]] = []
        for (block_num, par_num, line_num), line_words in sorted(line_map.items()):
            x0 = min(word["bbox"]["x"] for word in line_words)
            y0 = min(word["bbox"]["y"] for word in line_words)
            x1 = max(word["bbox"]["x"] + word["bbox"]["width"] for word in line_words)
            y1 = max(word["bbox"]["y"] + word["bbox"]["height"] for word in line_words)
            lines.append(
                {
                    "text": " ".join(word["text"] for word in line_words),
                    "block": block_num,
                    "paragraph": par_num,
                    "line": line_num,
                    "bbox": {"x": x0, "y": y0, "width": x1 - x0, "height": y1 - y0},
                    "average_confidence": round(
                        sum(max(0.0, float(word["confidence"])) for word in line_words) / max(1, len(line_words)), 1
                    ),
                }
            )

        text = "\n".join(line["text"] for line in lines).strip()
        if len(re.sub(r"\s+", "", text)) < 3:
            raise ValueError("OCR could not recognize useful text. Try a clearer scan, another language, or a higher DPI.")
        average_confidence = round(sum(confidences) / len(confidences), 1) if confidences else 0.0
        return {
            "page": page_number,
            "width": prepared.width,
            "height": prepared.height,
            "language": language,
            "average_confidence": average_confidence,
            "orientation": orientation,
            "text": text,
            "lines": lines,
            "words": words,
        }
    finally:
        prepared.close()


def _iter_pdf_images(path: Path, options: dict[str, Any]) -> Iterable[tuple[int, Image.Image]]:
    dpi = max(150, min(400, int(options.get("dpi", 240))))
    with fitz.open(path) as document:
        if document.page_count < 1:
            raise ValueError("The PDF has no pages.")
        if document.page_count > legacy.MAX_PDF_PAGES:
            raise ValueError(f"This PDF has too many pages for one OCR job. Maximum: {legacy.MAX_PDF_PAGES}.")
        for page_number in _parse_pages(options.get("pages", "all"), document.page_count):
            page = document[page_number - 1]
            yield page_number, _render_page(page, dpi)


def analyze_document(files: list[Path], output: Path, options: dict[str, Any]) -> None:
    if not files:
        raise ValueError("OCR analysis requires at least one file.")
    language = _language(options)
    pages: list[dict[str, Any]] = []
    next_page_number = 0

    for source in files:
        if source.suffix.lower() == ".pdf":
            if len(files) > 1:
                raise ValueError("PDF OCR analysis accepts one PDF at a time.")
            for page_number, image in _iter_pdf_images(source, options):
                try:
                    pages.append(_analyze_image(image, options, page_number, language))
                finally:
                    image.close()
            next_page_number = max((page["page"] for page in pages), default=0)
        else:
            for frame in _iter_input_frames(source):
                next_page_number += 1
                try:
                    pages.append(_analyze_image(frame, options, next_page_number, language))
                finally:
                    frame.close()

    if not pages:
        raise ValueError("OCR analysis produced no pages.")
    word_count = sum(len(page["words"]) for page in pages)
    character_count = sum(len(page["text"]) for page in pages)
    weighted_confidences = [float(word["confidence"]) for page in pages for word in page["words"] if float(word["confidence"]) >= 0]
    result = {
        "version": "1.0",
        "engine": "AJN PDF OCR",
        "language": language,
        "page_count": len(pages),
        "word_count": word_count,
        "character_count": character_count,
        "average_confidence": round(sum(weighted_confidences) / len(weighted_confidences), 1) if weighted_confidences else 0.0,
        "pages": pages,
    }
    encoded = json.dumps(result, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    if len(encoded) > MAX_OCR_JSON_BYTES:
        raise ValueError("OCR layout JSON is too large. Analyze fewer pages at a time.")
    output.write_bytes(encoded)
