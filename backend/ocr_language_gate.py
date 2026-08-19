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

REQUIRED_SCRIPT_MODELS = {
    "Latin",
    "Devanagari",
    "Telugu",
    "Tamil",
    "Kannada",
    "Malayalam",
}

MIN_ALL_LANGUAGE_MODELS = 50


def main() -> None:
    executable = command_path("tesseract")
    if not executable:
        raise RuntimeError("Tesseract OCR executable is missing from the production image.")

    installed = set(available_ocr_languages())

    missing_languages = sorted(set(REQUIRED_OCR_LANGUAGES).difference(installed))
    if missing_languages:
        labels = ", ".join(
            f"{code} ({REQUIRED_OCR_LANGUAGES[code]})"
            for code in missing_languages
        )
        raise RuntimeError(f"Required AJN PDF OCR language data is missing: {labels}")

    missing_scripts = sorted(REQUIRED_SCRIPT_MODELS.difference(installed))
    if missing_scripts:
        raise RuntimeError(
            "AJN PDF Auto Detect script models are missing: "
            + ", ".join(missing_scripts)
        )

    if len(installed) < MIN_ALL_LANGUAGE_MODELS:
        raise RuntimeError(
            f"AJN PDF all-language OCR runtime is incomplete: "
            f"{len(installed)} Tesseract models installed; expected at least "
            f"{MIN_ALL_LANGUAGE_MODELS} language/script models."
        )

    enabled = ", ".join(
        f"{code}:{REQUIRED_OCR_LANGUAGES[code]}"
        for code in REQUIRED_OCR_LANGUAGES
    )
    print(
        "PASS: AJN PDF all-language OCR runtime gate — "
        f"{len(installed)} installed models; core={enabled}"
    )


if __name__ == "__main__":
    main()
