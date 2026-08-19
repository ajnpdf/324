from __future__ import annotations

import re
from pathlib import Path
from typing import Any

import fitz
import pytesseract
from PIL import Image, ImageEnhance, ImageOps
from pytesseract import Output

from . import conversion_engine as legacy


AUTO_LANGUAGE_TOKENS = {"", "auto", "detect", "automatic"}
SCRIPT_CONFIDENCE_THRESHOLD = 4.0
MIN_SCRIPT_CHARACTERS = 8
MAX_AUTO_LANGUAGE_MODELS = 3
MAX_AUTO_PROBES = 3

SCRIPT_ALIASES = {
    "latin": "Latin",
    "cyrillic": "Cyrillic",
    "greek": "Greek",
    "arabic": "Arabic",
    "hebrew": "Hebrew",
    "devanagari": "Devanagari",
    "bengali": "Bengali",
    "gurmukhi": "Gurmukhi",
    "gujarati": "Gujarati",
    "oriya": "Oriya",
    "odia": "Oriya",
    "tamil": "Tamil",
    "telugu": "Telugu",
    "kannada": "Kannada",
    "malayalam": "Malayalam",
    "sinhala": "Sinhala",
    "thai": "Thai",
    "lao": "Lao",
    "tibetan": "Tibetan",
    "myanmar": "Myanmar",
    "khmer": "Khmer",
    "ethiopic": "Ethiopic",
    "georgian": "Georgian",
    "armenian": "Armenian",
    "hangul": "Hangul",
    "korean": "Hangul",
    "japanese": "Japanese",
    "han": "Han",
    "hans": "HanS",
    "hant": "HanT",
    "fraktur": "Fraktur",
}

LANGUAGE_SCRIPT = {
    "eng": "Latin", "afr": "Latin", "cat": "Latin", "ces": "Latin", "dan": "Latin",
    "deu": "Latin", "est": "Latin", "fin": "Latin", "fra": "Latin", "hrv": "Latin",
    "hun": "Latin", "ind": "Latin", "isl": "Latin", "ita": "Latin", "lav": "Latin",
    "lit": "Latin", "nld": "Latin", "nor": "Latin", "pol": "Latin", "por": "Latin",
    "ron": "Latin", "slk": "Latin", "slv": "Latin", "spa": "Latin", "swe": "Latin",
    "tur": "Latin", "vie": "Latin",
    "rus": "Cyrillic", "ukr": "Cyrillic", "bel": "Cyrillic", "bul": "Cyrillic",
    "mkd": "Cyrillic", "kaz": "Cyrillic", "kir": "Cyrillic", "srp": "Cyrillic",
    "ell": "Greek",
    "ara": "Arabic", "fas": "Arabic", "urd": "Arabic",
    "heb": "Hebrew",
    "hin": "Devanagari", "mar": "Devanagari", "nep": "Devanagari", "san": "Devanagari",
    "ben": "Bengali", "asm": "Bengali",
    "pan": "Gurmukhi", "guj": "Gujarati", "ori": "Oriya", "ory": "Oriya",
    "tam": "Tamil", "tel": "Telugu", "kan": "Kannada", "mal": "Malayalam",
    "sin": "Sinhala", "tha": "Thai", "lao": "Lao", "mya": "Myanmar", "khm": "Khmer",
    "amh": "Ethiopic", "tir": "Ethiopic", "kat": "Georgian", "hye": "Armenian",
    "kor": "Hangul", "jpn": "Japanese", "chi_sim": "HanS", "chi_tra": "HanT",
}

SCRIPT_FALLBACK_LANGUAGES = {
    "Latin": ("eng",),
    "Cyrillic": ("rus",),
    "Greek": ("ell",),
    "Arabic": ("ara",),
    "Hebrew": ("heb",),
    "Devanagari": ("hin",),
    "Bengali": ("ben",),
    "Gurmukhi": ("pan",),
    "Gujarati": ("guj",),
    "Oriya": ("ori", "ory"),
    "Tamil": ("tam",),
    "Telugu": ("tel",),
    "Kannada": ("kan",),
    "Malayalam": ("mal",),
    "Sinhala": ("sin",),
    "Thai": ("tha",),
    "Lao": ("lao",),
    "Myanmar": ("mya",),
    "Khmer": ("khm",),
    "Ethiopic": ("amh",),
    "Georgian": ("kat",),
    "Armenian": ("hye",),
    "Hangul": ("kor",),
    "Japanese": ("jpn",),
    "HanS": ("chi_sim",),
    "HanT": ("chi_tra",),
}


def _canonical_script(value: object) -> str:
    raw = str(value or "").strip()
    if not raw:
        return "Unknown"
    return SCRIPT_ALIASES.get(raw.casefold(), raw)


def _installed_language_map() -> dict[str, str]:
    return {item.casefold(): item for item in legacy.available_ocr_languages() if item}


def _validate_installed_language(requested: str, installed: dict[str, str]) -> str:
    parts = [item.strip() for item in requested.split("+") if item.strip()]
    if not parts:
        parts = ["eng"]
    resolved: list[str] = []
    missing: list[str] = []
    for part in parts:
        exact = installed.get(part.casefold())
        if exact:
            resolved.append(exact)
        else:
            missing.append(part)
    if missing:
        raise ValueError(f"OCR language data is not installed: {', '.join(sorted(missing))}")
    return "+".join(resolved)


def _prepare_probe(image: Image.Image) -> Image.Image:
    prepared = ImageOps.exif_transpose(image.copy()).convert("RGB")
    max_side = max(prepared.size)
    if max_side > 2200:
        ratio = 2200.0 / max_side
        resized = prepared.resize(
            (max(1, int(prepared.width * ratio)), max(1, int(prepared.height * ratio))),
            Image.Resampling.LANCZOS,
        )
        prepared.close()
        prepared = resized
    gray = ImageOps.grayscale(prepared)
    prepared.close()
    gray = ImageOps.autocontrast(gray, cutoff=1)
    gray = ImageEnhance.Contrast(gray).enhance(1.2)
    return gray.convert("RGB")


def _selected_pdf_indexes(raw: object, total: int) -> list[int]:
    value = str(raw or "all").strip().lower()
    if value in {"", "all", "*"}:
        return list(range(total))
    selected: set[int] = set()
    for item in value.split(","):
        token = item.strip()
        if not token:
            continue
        match = re.fullmatch(r"(\d+)(?:\s*-\s*(\d+))?", token)
        if not match:
            raise ValueError("OCR pages must look like all, 2, 1-3, or 1,4,7-9.")
        start = int(match.group(1))
        end = int(match.group(2) or start)
        if start < 1 or end < start or end > total:
            raise ValueError(f"OCR page range {token} is outside 1-{total}.")
        selected.update(range(start - 1, end))
    if not selected:
        raise ValueError("Select at least one OCR page.")
    return sorted(selected)


def _sample_from_indexes(indexes: list[int], maximum: int = MAX_AUTO_PROBES) -> list[int]:
    if not indexes:
        return []
    candidates = [indexes[0], indexes[len(indexes) // 2], indexes[-1]]
    result: list[int] = []
    for index in candidates:
        if index not in result:
            result.append(index)
        if len(result) >= maximum:
            break
    return result


def _probe_images(files: list[Path], options: dict[str, Any]) -> list[Image.Image]:
    if not files:
        raise ValueError("OCR requires at least one source file.")
    probes: list[Image.Image] = []
    first = files[0]
    if first.suffix.lower() == ".pdf":
        dpi = max(150, min(240, int(options.get("dpi", 220))))
        with fitz.open(first) as document:
            if document.page_count < 1:
                raise ValueError("The PDF has no pages.")
            matrix = fitz.Matrix(dpi / 72.0, dpi / 72.0)
            selected_indexes = _selected_pdf_indexes(options.get("pages", "all"), document.page_count)
            for page_index in _sample_from_indexes(selected_indexes):
                page = document[page_index]
                pix = page.get_pixmap(matrix=matrix, alpha=False)
                image = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
                try:
                    probes.append(_prepare_probe(image))
                finally:
                    image.close()
        return probes

    for source in files[:MAX_AUTO_PROBES]:
        with Image.open(source) as image:
            try:
                image.seek(0)
            except Exception:
                pass
            probes.append(_prepare_probe(image))
    return probes


def _detect_script(image: Image.Image) -> tuple[str, float]:
    executable = legacy.command_path("tesseract")
    if not executable:
        raise RuntimeError("Tesseract OCR is unavailable on the processing server.")
    pytesseract.pytesseract.tesseract_cmd = executable
    try:
        data = pytesseract.image_to_osd(image, output_type=Output.DICT)
        return _canonical_script(data.get("script")), float(data.get("script_conf") or 0.0)
    except Exception:
        return "Unknown", 0.0


def _ocr_candidate_score(
    image: Image.Image,
    language: str,
) -> float:
    """
    Score a candidate OCR model using both Tesseract confidence and
    textual cleanliness.

    Confidence alone is not enough: visually similar Latin/Cyrillic
    glyphs can receive high confidence from the wrong model.
    """
    try:
        data = pytesseract.image_to_data(
            image,
            lang=language,
            config="--oem 1 --psm 3 -c preserve_interword_spaces=1",
            output_type=Output.DICT,
        )
    except Exception:
        return -1.0

    confidences: list[float] = []
    text_parts: list[str] = []

    raw_text = data.get("text", [])
    raw_conf = data.get("conf", [])

    for index, raw in enumerate(raw_text):
        token = str(raw or "").strip()

        if not token:
            continue

        text_parts.append(token)

        try:
            confidence = float(
                raw_conf[index]
            )

            if confidence >= 0:
                confidences.append(
                    confidence
                )
        except Exception:
            pass

    if not text_parts:
        return -1.0

    joined = " ".join(
        text_parts
    )

    compact = re.sub(
        r"\s+",
        "",
        joined,
    )

    average_confidence = (
        sum(confidences) / len(confidences)
        if confidences
        else 0.0
    )

    visible = [
        char
        for char in joined
        if not char.isspace()
    ]

    if not visible:
        return -1.0

    letters = sum(
        1
        for char in visible
        if char.isalpha()
    )

    digits_or_symbols = (
        len(visible) - letters
    )

    letter_ratio = (
        letters / len(visible)
    )

    symbol_ratio = (
        digits_or_symbols / len(visible)
    )

    clean_words = 0
    noisy_words = 0

    edge_punctuation = (
        ".,:;!?()[]{}"
        "\"'"
        "“”‘’"
        "-–—"
    )

    for token in text_parts:
        word = token.strip(
            edge_punctuation
        )

        if not word:
            continue

        if word.isalpha():
            clean_words += 1
            continue

        contains_letter = any(
            char.isalpha()
            for char in word
        )

        contains_noise = any(
            not char.isalpha()
            and char not in {"'", "’", "-"}
            for char in word
        )

        if contains_letter and contains_noise:
            noisy_words += 1

    word_count = max(
        1,
        len(text_parts),
    )

    clean_word_ratio = (
        clean_words / word_count
    )

    noisy_word_ratio = (
        noisy_words / word_count
    )

    # Validate that the candidate model is actually producing the
    # script it claims to represent.
    expected_scripts = (
        _expected_scripts_for_language(
            language
        )
    )

    script_counts: dict[str, int] = {}

    for character in joined:
        actual_script = (
            _character_script(
                character
            )
        )

        if actual_script:
            script_counts[
                actual_script
            ] = (
                script_counts.get(
                    actual_script,
                    0,
                )
                + 1
            )

    script_adjustment = 0.0

    if (
        expected_scripts
        and script_counts
    ):
        actual_script, actual_count = max(
            script_counts.items(),
            key=lambda item: item[1],
        )

        actual_total = sum(
            script_counts.values()
        )

        actual_ratio = (
            actual_count / actual_total
            if actual_total
            else 0.0
        )

        if any(
            _compatible_script(
                expected,
                actual_script,
            )
            for expected in expected_scripts
        ):
            script_adjustment += (
                6.0 * actual_ratio
            )
        else:
            script_adjustment -= (
                18.0 * actual_ratio
            )

    length_bonus = min(
        8.0,
        len(compact) / 80.0,
    )

    # Wrong-script OCR often produces high-confidence strings such as
    # "5ТУБУ", "$ОЕУТ1ЮМ$", etc. The cleanliness terms below penalize
    # those mixed letter/digit/symbol artifacts.
    return (
        average_confidence
        + length_bonus
        + (8.0 * letter_ratio)
        + (8.0 * clean_word_ratio)
        - (12.0 * noisy_word_ratio)
        - (6.0 * symbol_ratio)
        + script_adjustment
    )


def _auto_language_for_probe(
    image: Image.Image,
    installed: dict[str, str],
    script: str,
    confidence: float,
) -> tuple[str, str, float]:
    """
    Select an OCR model without blindly trusting OSD.

    Tesseract OSD can confuse Latin and Cyrillic because many glyphs
    are visually similar. Therefore Latin/Cyrillic detections are
    cross-checked against the opposite generic script model before
    accepting a language.
    """
    candidates: list[str] = []

    def add_candidate(
        token: str,
    ) -> None:
        resolved = installed.get(
            token.casefold()
        )

        if not resolved:
            return

        lowered = resolved.casefold()

        if lowered in {
            "osd",
            "equ",
        }:
            return

        if lowered.endswith(
            "_vert"
        ):
            return

        if resolved not in candidates:
            candidates.append(
                resolved
            )

    canonical_script = (
        _canonical_script(
            script
        )
    )

    # Generic script model first. This is important for Auto mode
    # because a script model supports multiple languages sharing the
    # same writing system.
    add_candidate(
        canonical_script
    )

    # Normal language fallback for that detected script.
    for code in SCRIPT_FALLBACK_LANGUAGES.get(
        canonical_script,
        (),
    ):
        add_candidate(
            code
        )

    # Latin/Cyrillic are especially easy for OSD to confuse.
    # Cross-check the opposite script rather than trusting OSD.
    if canonical_script == "Latin":
        add_candidate(
            "Cyrillic"
        )

        if installed.get(
            "cyrillic"
        ) is None:
            add_candidate(
                "rus"
            )

    elif canonical_script == "Cyrillic":
        add_candidate(
            "Latin"
        )

        if installed.get(
            "latin"
        ) is None:
            add_candidate(
                "eng"
            )

    # Unknown or low-confidence OSD gets a safe Latin/English probe
    # while still preserving any usable detected model.
    if (
        canonical_script == "Unknown"
        or confidence < SCRIPT_CONFIDENCE_THRESHOLD
    ):
        add_candidate(
            "Latin"
        )

        add_candidate(
            "eng"
        )

    # Last-resort English fallback.
    if not candidates:
        add_candidate(
            "eng"
        )

    if not candidates:
        candidates = [
            value
            for key, value in installed.items()
            if (
                key not in {
                    "osd",
                    "equ",
                }
                and not value.lower().endswith(
                    "_vert"
                )
            )
        ][:1]

    if not candidates:
        raise RuntimeError(
            "No usable Tesseract OCR language model is installed."
        )

    if len(candidates) == 1:
        return (
            candidates[0],
            canonical_script,
            confidence,
        )

    scored = [
        (
            candidate,
            _ocr_candidate_score(
                image,
                candidate,
            ),
        )
        for candidate in candidates
    ]

    scored.sort(
        key=lambda item: item[1],
        reverse=True,
    )

    best_language = (
        scored[0][0]
    )

    return (
        best_language,
        canonical_script,
        confidence,
    )


def _expected_scripts_for_language(language: str) -> set[str]:
    scripts: set[str] = set()
    script_names = set(SCRIPT_ALIASES.values())
    for part in language.split("+"):
        token = part.strip()
        if not token:
            continue
        canonical = _canonical_script(token)
        if canonical in script_names:
            scripts.add(canonical)
        mapped = LANGUAGE_SCRIPT.get(token.casefold())
        if mapped:
            scripts.add(mapped)
    return scripts


def resolve_ocr_options(files: list[Path], options: dict[str, Any]) -> dict[str, Any]:
    """Resolve Auto Detect and reject obvious manual language/script mismatches."""
    resolved = dict(options)
    installed = _installed_language_map()
    if not installed:
        raise RuntimeError("Tesseract OCR language data is unavailable on the processing server.")
    requested = str(resolved.get("language", "auto")).strip() or "auto"
    probes = _probe_images(files, resolved)
    if not probes:
        raise ValueError("OCR could not read a source page for language detection.")
    try:
        detections = [_detect_script(probe) for probe in probes]
        detected_scripts = [
            script for script, confidence in detections
            if script != "Unknown" and confidence >= SCRIPT_CONFIDENCE_THRESHOLD
        ]
        resolved["_ajn_detected_scripts"] = "+".join(dict.fromkeys(detected_scripts))
        resolved["_ajn_requested_language"] = requested
        if requested.casefold() in AUTO_LANGUAGE_TOKENS:
            selected: list[str] = []
            scored_meta: list[tuple[str, str, float]] = []
            for probe, (script, confidence) in zip(probes, detections):
                language, resolved_script, resolved_confidence = _auto_language_for_probe(
                    probe, installed, script, confidence
                )
                scored_meta.append((language, resolved_script, resolved_confidence))
                if language not in selected:
                    selected.append(language)
                if len(selected) >= MAX_AUTO_LANGUAGE_MODELS:
                    break
            if not selected:
                raise RuntimeError("Auto Detect could not select an OCR language model.")
            resolved["language"] = "+".join(selected)
            resolved["_ajn_language_mode"] = "auto"
            resolved["_ajn_auto_models"] = "+".join(selected)

            expected_output_scripts: set[str] = set()

            for selected_model in selected:
                expected_output_scripts.update(
                    _expected_scripts_for_language(
                        selected_model
                    )
                )

            if expected_output_scripts:
                resolved["_ajn_expected_output_scripts"] = "+".join(
                    sorted(
                        expected_output_scripts
                    )
                )

            resolved["_ajn_detection_summary"] = ",".join(
                f"{script}:{confidence:.1f}->{language}"
                for language, script, confidence in scored_meta
            )
            return resolved

        language = _validate_installed_language(requested, installed)
        expected_scripts = _expected_scripts_for_language(language)
        confident_detections = [
            (script, confidence)
            for script, confidence in detections
            if script != "Unknown" and confidence >= SCRIPT_CONFIDENCE_THRESHOLD
        ]
        compatible = [
            (script, confidence)
            for script, confidence in confident_detections
            if not expected_scripts or script in expected_scripts
        ]
        mismatches = [
            (script, confidence)
            for script, confidence in confident_detections
            if expected_scripts and script not in expected_scripts
        ]
        if mismatches and not compatible:
            found = ", ".join(f"{script} ({confidence:.1f})" for script, confidence in mismatches)
            expected = ", ".join(sorted(expected_scripts))
            raise ValueError(
                f"The selected OCR language model ({language}) does not match the detected "
                f"document script: {found}. Choose Auto Detect or a language using "
                f"{expected} script."
            )
        resolved["language"] = language
        resolved["_ajn_language_mode"] = "manual"

        if expected_scripts:
            resolved["_ajn_expected_output_scripts"] = "+".join(
                sorted(
                    expected_scripts
                )
            )

        return resolved
    finally:
        for probe in probes:
            probe.close()


def _character_script(character: str) -> str | None:
    code = ord(character)
    if 0x0041 <= code <= 0x024F or 0x1E00 <= code <= 0x1EFF:
        return "Latin"
    if 0x0370 <= code <= 0x03FF:
        return "Greek"
    if 0x0400 <= code <= 0x052F:
        return "Cyrillic"
    if 0x0590 <= code <= 0x05FF:
        return "Hebrew"
    if 0x0600 <= code <= 0x06FF or 0x0750 <= code <= 0x077F or 0x08A0 <= code <= 0x08FF:
        return "Arabic"
    ranges = [
        (0x0900, 0x097F, "Devanagari"), (0x0980, 0x09FF, "Bengali"),
        (0x0A00, 0x0A7F, "Gurmukhi"), (0x0A80, 0x0AFF, "Gujarati"),
        (0x0B00, 0x0B7F, "Oriya"), (0x0B80, 0x0BFF, "Tamil"),
        (0x0C00, 0x0C7F, "Telugu"), (0x0C80, 0x0CFF, "Kannada"),
        (0x0D00, 0x0D7F, "Malayalam"), (0x0D80, 0x0DFF, "Sinhala"),
        (0x0E00, 0x0E7F, "Thai"), (0x0E80, 0x0EFF, "Lao"),
        (0x0F00, 0x0FFF, "Tibetan"), (0x1000, 0x109F, "Myanmar"),
        (0x10A0, 0x10FF, "Georgian"), (0x1200, 0x137F, "Ethiopic"),
        (0x1780, 0x17FF, "Khmer"), (0x3040, 0x30FF, "Japanese"),
        (0x4E00, 0x9FFF, "Han"), (0xAC00, 0xD7AF, "Hangul"),
    ]
    for start, end, script in ranges:
        if start <= code <= end:
            return script
    return None


def _compatible_script(expected: str, actual: str) -> bool:
    if expected == actual:
        return True
    if expected in {"Han", "HanS", "HanT"} and actual == "Han":
        return True
    if expected == "Japanese" and actual in {"Japanese", "Han"}:
        return True
    return False


def validate_ocr_text_output(output: Path, options: dict[str, Any]) -> None:
    """Semantic guard against returning a successful TXT in the wrong script."""
    if output.suffix.lower() != ".txt" or not output.exists():
        return
    text = output.read_text(encoding="utf-8-sig", errors="replace")
    meaningful = re.sub(r"---\s*(?:Page|Image)\s+\d+\s*---", "", text, flags=re.IGNORECASE)
    if len(re.sub(r"\s+", "", meaningful)) < 3:
        raise ValueError("OCR completed but no useful text was recognized.")
    expected_script_value = str(
        options.get("_ajn_expected_output_scripts")
        or options.get("_ajn_detected_scripts", "")
    )

    expected_scripts = {
        _canonical_script(script)
        for script in expected_script_value.split("+")
        if script.strip()
    }
    expected_scripts.discard("Unknown")
    if not expected_scripts:
        return
    counts: dict[str, int] = {}
    for character in meaningful:
        script = _character_script(character)
        if script:
            counts[script] = counts.get(script, 0) + 1
    total = sum(counts.values())
    if total < MIN_SCRIPT_CHARACTERS:
        return
    actual, actual_count = max(counts.items(), key=lambda item: item[1])
    if actual_count / total < 0.55:
        return
    if not any(_compatible_script(expected, actual) for expected in expected_scripts):
        expected_label = ", ".join(sorted(expected_scripts))
        raise ValueError(
            f"OCR output quality check failed: the document was detected as {expected_label} "
            f"but the recognized text is predominantly {actual}. "
            "Use Auto Detect or choose the correct OCR language and try again."
        )
