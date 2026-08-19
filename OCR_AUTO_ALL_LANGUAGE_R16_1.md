# AJN PDF OCR Auto Detect + All-Language Runtime

This document supersedes the six-language-only OCR runtime description in the original R16 platform-depth notes. The six core Indian-language workflows remain acceptance-critical, but the production OCR image now installs the full Debian Tesseract language/script set and exposes the models that are actually installed.

## Product behavior

### Default mode: Auto Detect

Scan to Text, Searchable PDF and OCR Studio default to `language=auto`.

The backend does not pass `auto` to Tesseract. Before recognition it:

1. samples up to three relevant pages/images;
2. runs Tesseract OSD script detection;
3. chooses an installed script model and a strong language fallback candidate;
4. scores candidate OCR output where more than one model is suitable;
5. combines up to three models for mixed-script documents;
6. passes only real installed Tesseract model names to the existing OCR processors.

For selected-page PDF OCR, Auto Detect samples from the selected page range rather than unrelated pages.

### Manual language mode

Manual model selection remains available.

When OSD has enough confidence and the selected language clearly conflicts with the document script, AJN PDF fails with an actionable language-mismatch message instead of returning wrong-script garbage.

Manual mixed-language jobs may combine up to three models, for example `eng+tel`.

### Post-OCR semantic guard

TXT OCR output is checked after recognition.

If a document was confidently detected as one script but the generated text is predominantly a different script, the job fails instead of being reported as a successful conversion. This specifically prevents the production failure class where a clear English/Latin document was returned as Telugu-like gibberish.

## Runtime language coverage

`backend/Dockerfile` installs `tesseract-ocr-all`.

`backend/ocr_language_gate.py` requires:

- the six promoted core languages: English, Hindi, Telugu, Tamil, Kannada and Malayalam;
- OSD;
- the core script models used by Auto Detect;
- at least 50 installed Tesseract language/script models.

The exact model list is still discovered at runtime with `tesseract --list-langs`. The frontend reads the backend capability manifest and lists the models that are actually installed instead of claiming a language that the server cannot process.

## Shared OCR policy

`backend/app/ocr_auto.py` is applied in `job_worker.py` before every processor whose processor id begins with `ocr_`, and before deep OCR analysis.

That means the same Auto Detect/manual-validation policy covers:

- Image to Text
- Image to Word
- Image to Searchable PDF
- Handwriting Image to Text
- Scanned PDF to Text
- Scanned PDF to Word
- Scanned PDF to Searchable PDF
- OCR Studio layout JSON / deep analysis
- API routes that use the same worker

The existing processing-quality pipeline remains responsible for orientation, deskew, denoise, contrast normalization, OCR confidence and output-format validation.

## Release acceptance

A release is not approved merely because OCR returns HTTP 200.

The production Docker build must pass:

1. all-language runtime breadth;
2. six-language explicit semantic OCR;
3. Auto Detect English semantic OCR;
4. wrong-language mismatch protection;
5. wrong-script output rejection;
6. deep OCR JSON acceptance;
7. selected-page TXT/DOCX/searchable-PDF acceptance;
8. the broader R15/R16/full conversion acceptance suites.

The exact Study Connect image that exposed the live bug should also be used as a manual release sample: the readable English headings and paragraphs must be returned as English text.
