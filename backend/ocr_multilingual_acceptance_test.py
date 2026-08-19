from __future__ import annotations

import re
import tempfile
import unicodedata
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from app.conversion_engine import SPECS
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


def _font(candidates: list[str], size: int = 76) -> ImageFont.FreeTypeFont:
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            continue
    raise RuntimeError(f"Required Unicode OCR acceptance font is missing: {candidates[0]}")


def _normalize(value: str) -> str:
    return re.sub(r"\s+", "", unicodedata.normalize("NFC", value)).casefold()


def _make_image(path: Path, text: str, font: ImageFont.FreeTypeFont) -> None:
    image = Image.new("RGB", (2100, 520), "white")
    draw = ImageDraw.Draw(image)
    draw.text((90, 120), text, fill="black", font=font)
    draw.line([(90, 260), (2000, 260)], fill=(230, 230, 230), width=2)
    image.save(path, "PNG", optimize=True)
    image.close()


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
                    f"{language} OCR semantic acceptance failed. Expected one of {keywords!r}; got {recognized!r}"
                )
            print(f"PASS: OCR {language} — {recognized.strip()[:120]}")

    print("PASS: AJN PDF six-language OCR semantic acceptance")


if __name__ == "__main__":
    main()
