from __future__ import annotations

import tempfile
from pathlib import Path

import fitz
from docx import Document

from app.conversion_engine import validate_output_file
from app.ocr_selected import run_selected_pdf_ocr


def _source_pdf(path: Path) -> None:
    document = fitz.open()
    try:
        first = document.new_page(width=595, height=842)
        first.insert_text((72, 150), "AJN OCR PAGE ONE 1111", fontsize=28)
        second = document.new_page(width=595, height=842)
        second.insert_text((72, 150), "AJN OCR PAGE TWO 2222", fontsize=28)
        document.save(path)
    finally:
        document.close()


def main() -> None:
    with tempfile.TemporaryDirectory(prefix="ajn-selected-ocr-") as temporary:
        root = Path(temporary)
        source = root / "source.pdf"
        _source_pdf(source)
        options = {
            "language": "eng",
            "dpi": 240,
            "pages": "2",
            "auto_rotate": False,
            "deskew": False,
            "denoise": False,
            "contrast": 1.1,
            "psm": 6,
        }

        text_output = root / "selected.txt"
        run_selected_pdf_ocr("ocr_pdf_text", source, text_output, options, root)
        text = text_output.read_text(encoding="utf-8").upper()
        assert "PAGE 2" in text
        assert "TWO" in text and "2222" in text
        assert "1111" not in text

        word_output = root / "selected.docx"
        run_selected_pdf_ocr("ocr_pdf_word", source, word_output, options, root)
        validate_output_file(word_output, ".docx")
        doc = Document(word_output)
        word_text = "\n".join(paragraph.text for paragraph in doc.paragraphs).upper()
        assert "PAGE 2" in word_text
        assert "TWO" in word_text and "2222" in word_text
        assert "1111" not in word_text

        searchable_output = root / "selected.pdf"
        run_selected_pdf_ocr("ocr_pdf_searchable", source, searchable_output, options, root)
        validate_output_file(searchable_output, ".pdf")
        with fitz.open(searchable_output) as searchable:
            assert searchable.page_count == 1
            searchable_text = searchable[0].get_text().upper()
            assert "TWO" in searchable_text and "2222" in searchable_text
            assert "1111" not in searchable_text

    print("PASS: AJN PDF selected-page OCR — TXT, Word and searchable PDF honor pages=2")


if __name__ == "__main__":
    main()
