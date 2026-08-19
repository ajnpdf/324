from __future__ import annotations

import json
import tempfile
from pathlib import Path

import fitz
from PIL import Image, ImageDraw, ImageFont

from app.ocr_deep import analyze_document


def _font(size: int) -> ImageFont.FreeTypeFont:
    for candidate in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "C:/Windows/Fonts/arial.ttf",
    ):
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            continue
    raise RuntimeError("No OCR acceptance font is available.")


def _image(path: Path, text: str) -> None:
    image = Image.new("RGB", (1500, 500), "white")
    draw = ImageDraw.Draw(image)
    draw.text((90, 120), text, font=_font(72), fill="black")
    image.save(path, "PNG")
    image.close()


def _pdf(path: Path) -> None:
    document = fitz.open()
    try:
        first = document.new_page(width=595, height=842)
        first.insert_text((72, 160), "AJN FIRST PAGE", fontsize=30)
        second = document.new_page(width=595, height=842)
        second.insert_text((72, 160), "AJN SECOND PAGE 2468", fontsize=30)
        document.save(path)
    finally:
        document.close()


def main() -> None:
    with tempfile.TemporaryDirectory(prefix="ajn-ocr-deep-") as temporary:
        root = Path(temporary)
        image_path = root / "scan.png"
        image_output = root / "scan.json"
        _image(image_path, "AJN OCR LAYOUT 12345")
        analyze_document(
            [image_path],
            image_output,
            {
                "language": "eng",
                "dpi": 240,
                "auto_rotate": False,
                "deskew": False,
                "denoise": False,
                "contrast": 1.2,
                "psm": 6,
                "min_word_confidence": 0,
            },
        )
        image_result = json.loads(image_output.read_text(encoding="utf-8"))
        assert image_result["page_count"] == 1
        assert image_result["word_count"] >= 3
        assert image_result["average_confidence"] > 20
        page = image_result["pages"][0]
        assert "AJN" in page["text"]
        assert page["words"]
        assert all(word["bbox"]["width"] > 0 and word["bbox"]["height"] > 0 for word in page["words"])
        assert page["lines"]

        pdf_path = root / "two-pages.pdf"
        pdf_output = root / "pdf.json"
        _pdf(pdf_path)
        analyze_document(
            [pdf_path],
            pdf_output,
            {
                "language": "eng",
                "dpi": 220,
                "pages": "2",
                "auto_rotate": False,
                "deskew": False,
                "denoise": False,
                "contrast": 1.1,
                "psm": 6,
            },
        )
        pdf_result = json.loads(pdf_output.read_text(encoding="utf-8"))
        assert pdf_result["page_count"] == 1
        assert pdf_result["pages"][0]["page"] == 2
        assert "SECOND" in pdf_result["pages"][0]["text"].upper()
        assert "2468" in pdf_result["pages"][0]["text"]

    print("PASS: AJN PDF deep OCR layout JSON — words, boxes, confidence and page selection")


if __name__ == "__main__":
    main()
