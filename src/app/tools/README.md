# AjnPDF — 44 Browser-Only Tool Pages (TSX)

All tools run **100% in the browser** — no server, no API, no data uploaded anywhere.

---

## 🚀 Setup & Technical Notes

### Dependencies
All processing units depend on the following root-level libraries:
- **pdf-lib**: Creates and modifies PDFs (merge, split, rotate, watermark, sign, add text/images, metadata, protect).
- **pdfjs-dist**: Renders PDF pages to canvas (PDF→JPG) and extracts text for OCR and analysis.
- **jszip**: Creates and reads ZIP files (Split to ZIP, PDF to ZIP, ZIP to PDF).
- **mammoth**: Parses .docx files for Word to PDF conversion.
- **xlsx**: Reads .xlsx, .xls, and .csv files for spreadsheet conversion.

### Usage
Every tool page is fully responsive and uses inline React style objects for maximum portability. No external APIs are called during file processing.

---

## 📦 Files Included

### Shared utilities (required by all tools)
| File | Purpose |
|------|---------|
| `_shared.tsx` | UI components: `ToolLayout`, `Dropzone`, `Btn`, `Slider`, `Pills`, `DoneState`, `InfoBox`, `Field`, `Grid2` |
| `_pdfUtils.ts` | All PDF operations via `pdf-lib` + `pdfjs-dist` + `jszip` |
| `_imageUtils.ts` | All image operations via browser Canvas API |

### 44 Tool Pages
| # | File | Tool |
|---|------|------|
| 1 | `merge-pdf.tsx` | Merge PDF |
| 2 | `split-pdf.tsx` | Split PDF |
| 3 | `compress-pdf.tsx` | Compress PDF |
| 4 | `protect-pdf.tsx` | Protect PDF |
| 5 | `unlock-pdf.tsx` | Unlock PDF |
| 6 | `rotate-pdf.tsx` | Rotate PDF |
| 7 | `delete-pages.tsx` | Delete Pages |
| 8 | `organize-pdf.tsx` | Organize PDF |
| 9 | `crop-pdf.tsx` | Crop PDF |
| 10 | `watermark-pdf.tsx` | Watermark PDF |
| 11 | `add-numbers.tsx` | Add Page Numbers |
| 12 | `flatten-pdf.tsx` | Flatten PDF |
| 13 | `repair-pdf.tsx` | Repair PDF |
| 14 | `compare-pdf.tsx` | Compare PDF |
| 15 | `add-text.tsx` | Add Text to PDF |
| 16 | `sign-pdf.tsx` | Sign PDF (canvas pad) |
| 17 | `smart-read.tsx` | Smart Read / Extract Text |
| 18 | `searchable-pdf.tsx` | Searchable PDF |
| 19 | `word-to-pdf.tsx` | Word to PDF |
| 20 | `excel-to-pdf.tsx` | Excel to PDF |
| 21 | `jpg-to-pdf.tsx` | JPG to PDF |
| 22 | `png-to-pdf.tsx` | PNG to PDF |
| 23 | `ppt-to-pdf.tsx" | PPT to PDF |
| 24 | `html-to-pdf.tsx` | HTML to PDF |
| 25 | `zip-to-pdf.tsx` | ZIP to PDF |
| 26 | `pdf-to-word.tsx` | PDF to Word (.txt) |
| 27 | `pdf-to-jpg.tsx` | PDF to JPG |
| 28 | `pdf-to-excel.tsx` | PDF to Excel (CSV) |
| 29 | `pdf-to-ppt.tsx` | PDF to PPT (.pptx) |
| 30 | `pdf-to-zip.tsx` | PDF to ZIP |
| 31 | `reduce-image.tsx` | Reduce / Compress Image |
| 32 | `resize-image.tsx" | Resize Image |
| 33 | `crop-image.tsx` | Crop Image |
| 34 | `rotate-image.tsx` | Rotate Image |
| 35 | `watermark-image.tsx` | Watermark Image |
| 36 | `enhance-image.tsx` | Smart Enhancer (upscale) |
| 37 | `remove-background.tsx` | Remove Background |
| 38 | `blur-face.tsx` | Blur Face / Region |
| 39 | `photo-editor.tsx` | Photo Editor |
| 40 | `meme-maker.tsx` | Meme Maker |
| 41 | `add-image-to-pdf.tsx` | Add Image to PDF |
| 42 | `pdf-metadata.tsx` | PDF Metadata Editor |
| 43 | `flip-image.tsx` | Flip Image |
| 44 | `convert-image.tsx` | Convert Image Format |

---

## 📐 Mobile & Desktop Responsive

Every tool page is fully responsive:
- **Mobile**: single-column layout, large touch targets, full-width buttons
- **Desktop**: two-column grids where appropriate, compact spacing
- All styles are inline React style objects.
- The `.ajn-grid2` class switches to single column on screens < 640px via a CSS media query.

---

## ⚠️ Known Limitations

| Tool | Limitation |
|------|-----------|
| Compress PDF | Browser re-saves the PDF; image re-compression needs a server |
| Protect PDF | Metadata-only; AES-256 encryption needs a server library |
| Word → PDF | Extracts plain text; rich formatting (tables, images) is simplified |
| PPT → PDF | Extracts slide text only; charts and media are not rendered |
| HTML → PDF | Plain text extraction; CSS/layout/images not rendered |
| Remove BG | Corner-sampling heuristic; AI segmentation needs a server |
| Searchable PDF | Preserves existing text layer; OCR for scanned pages needs Tesseract |
