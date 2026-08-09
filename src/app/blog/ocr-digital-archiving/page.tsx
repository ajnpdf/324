import { GuideArticle } from '@/components/blog/guide-article';

export default function OcrArchivingGuide() {
  return <GuideArticle
    slug="ocr-digital-archiving"
    eyebrow="OCR guide"
    title="OCR for scanned documents and digital archives"
    summary="Good OCR starts with a readable scan, the correct language model and human review. Searchable output is useful, but recognition quality depends on the source document."
    readTime="6 minute guide"
    sections={[
      { title: 'Prepare a clean source image', paragraphs: ['Use a straight, well-lit scan with enough resolution to distinguish characters. Crop large empty borders and avoid shadows across text lines.', 'Rotated, blurred, compressed or low-contrast pages reduce recognition quality before the OCR engine begins.'], bullets: ['Keep pages upright', 'Use even lighting', 'Avoid motion blur', 'Capture the complete page'] },
      { title: 'Choose the correct language', paragraphs: ['The AJN PDF deployment can expose English, Hindi, Telugu, Tamil, Kannada and Malayalam when those Tesseract models are installed. Select the language that matches the page.', 'Mixed-language pages may need multiple OCR passes or additional review. The interface should never display a language model that the backend cannot load.'] },
      { title: 'Understand the output types', paragraphs: ['Scanned PDF to Text creates extracted text. Scanned PDF to Word creates an editable document with best-effort reconstruction. Searchable PDF adds a text layer while keeping the visible page image.', 'Complex tables, handwriting, decorative fonts and multi-column layouts may not preserve their original structure.'] },
      { title: 'Review before archiving', paragraphs: ['Search for important names, dates and reference numbers. Compare a sample of the extracted text with the scan and correct critical errors before relying on it.', 'AJN PDF analytics must not store recognized text, filenames or document contents. Only privacy-minimized event status and timing aggregates are permitted.'] },
    ]}
    checklist={['Use the installed language that matches the page', 'Check orientation and contrast first', 'Review critical names and numbers manually', 'Keep the original scan with the OCR result']}
    relatedTools={[
      { href: '/tools/scanned-pdf-to-text', title: 'Scanned PDF to Text', description: 'Extract readable text from scanned PDF pages.' },
      { href: '/tools/scanned-pdf-to-searchable-pdf', title: 'Searchable PDF', description: 'Add a searchable text layer to scanned pages.' },
      { href: '/tools/image-to-text', title: 'Image to Text', description: 'Recognize text from a supported image.' },
    ]}
  />;
}
