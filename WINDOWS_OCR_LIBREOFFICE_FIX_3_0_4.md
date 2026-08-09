# AJN PDF 3.0.4 Windows OCR + LibreOffice reliability fix

- Searchable PDF generation no longer depends on the `pdf` Tesseract config file. It enables PDF output with `tessedit_create_pdf=1`, so a custom language-only tessdata directory works on Windows.
- Windows LibreOffice now prefers `soffice.exe` instead of the hanging `soffice.COM` console wrapper.
- Office conversion uses an isolated profile per attempt, bounded process-tree timeout, cleanup, output-flush wait and one retry.
- Acceptance tests remain strict; failed OCR or office output still fails setup.
