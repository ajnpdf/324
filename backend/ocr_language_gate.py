from __future__ import annotations

from app.conversion_engine import available_ocr_languages, command_path


REQUIRED_OCR_LANGUAGES = {
    "eng": "English",
    "hin": "Hindi",
    "tel": "Telugu",
    "tam": "Tamil",
    "kan": "Kannada",
    "mal": "Malayalam",
    "osd": "Orientation and script detection",
}


def main() -> None:
    executable = command_path("tesseract")
    if not executable:
        raise RuntimeError("Tesseract OCR executable is missing from the production image.")

    installed = set(available_ocr_languages())
    missing = sorted(set(REQUIRED_OCR_LANGUAGES).difference(installed))
    if missing:
        labels = ", ".join(f"{code} ({REQUIRED_OCR_LANGUAGES[code]})" for code in missing)
        raise RuntimeError(f"Required AJN PDF OCR language data is missing: {labels}")

    enabled = ", ".join(f"{code}:{REQUIRED_OCR_LANGUAGES[code]}" for code in REQUIRED_OCR_LANGUAGES)
    print(f"PASS: AJN PDF multilingual OCR runtime gate — {enabled}")


if __name__ == "__main__":
    main()
