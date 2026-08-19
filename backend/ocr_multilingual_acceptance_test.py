from __future__ import annotations

import re
import tempfile
import unicodedata
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from app.conversion_engine import SPECS
from app.ocr_auto import resolve_ocr_options, validate_ocr_text_output
from app.processing_quality import run_conversion


CASES = {
    "eng": ("AJN PDF ENGLISH QUALITY", ["AJN", "PDF", "QUALITY"], [
        "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]),
    "hin": ("अजन पीडीएफ हिंदी परीक्षण", ["हिंदी", "परीक्षण"], [
        "/usr/share/fonts/truetype/noto/NotoSansDevanagari-Regular.ttf",
    ]),
    "tel": ("ఏజేఎన్ పీడీఎఫ్ తెలుగు పరీక్ష", ["తెలుగు", "పరీక్ష"], [
        "/usr/share/fonts/truetype/noto/NotoSansTelugu-Regular.ttf",
    ]),
    "tam": ("ஏஜேஎன் பிடிஎஃப் தமிழ் சோதனை", ["தமிழ்", "சோதனை"], [
        "/usr/share/fonts/truetype/noto/NotoSansTamil-Regular.ttf",
    ]),
    "kan": ("ಎಜೆಎನ್ ಪಿಡಿಎಫ್ ಕನ್ನಡ ಪರೀಕ್ಷೆ", ["ಕನ್ನಡ", "ಪರೀಕ್ಷೆ"], [
        "/usr/share/fonts/truetype/noto/NotoSansKannada-Regular.ttf",
    ]),
    "mal": ("എജെഎൻ പിഡിഎഫ് മലയാളം പരീക്ഷ", ["മലയാളം", "പരീക്ഷ"], [
        "/usr/share/fonts/truetype/noto/NotoSansMalayalam-Regular.ttf",
    ]),
}


def _font(candidates: list[str], size: int = 68) -> ImageFont.FreeTypeFont:
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            continue
    raise RuntimeError(f"Required Unicode OCR acceptance font is missing: {candidates[0]}")


def _normalize(value: str) -> str:
    return re.sub(r"\s+", "", unicodedata.normalize("NFC", value)).casefold()


def _make_image(path: Path, text: str, font: ImageFont.FreeTypeFont) -> None:
    image = Image.new("RGB", (2200, 1100), "white")
    draw = ImageDraw.Draw(image)
    lines = [text, text, text, text]
    y = 90
    for line in lines:
        draw.text((90, y), line, fill="black", font=font)
        y += 220
    image.save(path, "PNG", optimize=True)
    image.close()


def _run_image_text(
    source: Path,
    output: Path,
    workdir: Path,
    options: dict[str, object],
) -> str:
    run_conversion(
        SPECS["image-to-text"],
        [source],
        output,
        options,
        workdir,
        None,
    )
    return output.read_text(encoding="utf-8")


def main() -> None:
    spec = SPECS["image-to-text"]
    with tempfile.TemporaryDirectory(prefix="ajn-multilingual-ocr-") as temporary:
        root = Path(temporary)

        for language, (text, keywords, fonts) in CASES.items():
            workdir = root / language
            workdir.mkdir()
            source = workdir / "source.png"
            output = workdir / "result.txt"
            _make_image(source, text, _font(fonts))
            run_conversion(
                spec,
                [source],
                output,
                {
                    "language": language,
                    "dpi": 260,
                    "auto_rotate": False,
                    "deskew": False,
                    "denoise": False,
                    "contrast": 1.15,
                    "psm": 6,
                },
                workdir,
                None,
            )
            recognized = output.read_text(encoding="utf-8")
            normalized = _normalize(recognized)
            matches = sum(1 for keyword in keywords if _normalize(keyword) in normalized)
            if matches < 1:
                raise AssertionError(
                    f"{language} OCR semantic acceptance failed. "
                    f"Expected one of {keywords!r}; got {recognized!r}"
                )
            print(f"PASS: OCR {language} — {recognized.strip()[:120]}")

        auto_dir = root / "auto-english"
        auto_dir.mkdir()
        auto_source = auto_dir / "study-connect.png"
        auto_output = auto_dir / "result.txt"
        auto_lines = [
            "STUDY CONNECT SOLUTIONS PRIVATE LIMITED",
            "ABOUT STUDY CONNECT SOLUTIONS PRIVATE LIMITED",
            "WHY THIS INTERNSHIP MATTERS",
            "IMPORTANT NOTES",
        ]
        auto_font = _font(CASES["eng"][2], size=54)
        auto_image = Image.new("RGB", (2200, 1100), "white")
        auto_draw = ImageDraw.Draw(auto_image)
        auto_y = 110
        for auto_line in auto_lines:
            auto_draw.text((90, auto_y), auto_line, fill="black", font=auto_font)
            auto_y += 210
        auto_image.save(auto_source, "PNG", optimize=True)
        auto_image.close()
        auto_options = resolve_ocr_options(
            [auto_source],
            {
                "language": "auto",
                "dpi": 260,
                "auto_rotate": True,
                "deskew": True,
                "denoise": True,
                "contrast": 1.35,
                "psm": 6,
            },
        )
        selected_models = str(auto_options.get("language") or "")
        if not selected_models:
            raise AssertionError("Auto Detect did not select any OCR model.")
        recognized = _run_image_text(auto_source, auto_output, auto_dir, auto_options)
        validate_ocr_text_output(auto_output, auto_options)
        normalized = _normalize(recognized)
        if _normalize("STUDY CONNECT") not in normalized or _normalize("IMPORTANT NOTES") not in normalized:
            raise AssertionError(
                "Auto English OCR semantic acceptance failed. "
                f"models={selected_models!r}; output={recognized!r}"
            )
        print(f"PASS: OCR auto English — models={selected_models}; {recognized.strip()[:120]}")

        try:
            resolve_ocr_options(
                [auto_source],
                {
                    "language": "tel",
                    "dpi": 260,
                    "auto_rotate": True,
                    "deskew": True,
                    "denoise": True,
                },
            )
        except ValueError as exc:
            if "does not match" not in str(exc):
                raise
            print(f"PASS: wrong-language protection — {exc}")
        else:
            raise AssertionError(
                "Wrong-language protection failed: Telugu was accepted for a clear Latin page."
            )

        fake_output = auto_dir / "wrong-script.txt"
        fake_output.write_text(
            "--- Page 1 ---\nతెలుగు పరీక్ష తెలుగు పరీక్ష తెలుగు పరీక్ష",
            encoding="utf-8",
        )
        try:
            validate_ocr_text_output(fake_output, {"_ajn_detected_scripts": "Latin"})
        except ValueError as exc:
            if "predominantly Telugu" not in str(exc):
                raise
            print(f"PASS: OCR output script guard — {exc}")
        else:
            raise AssertionError("OCR output script guard accepted wrong-script text.")

    print("PASS: AJN PDF multilingual + auto-detect OCR semantic acceptance")


if __name__ == "__main__":
    main()
