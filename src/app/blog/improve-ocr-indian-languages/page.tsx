import { GuideArticle } from '@/components/blog/guide-article';
import { guideMetadata } from '@/lib/guide-metadata';

export const metadata = guideMetadata('improve-ocr-indian-languages', 'How to improve OCR for Telugu, Hindi and other Indian-language scans', 'Clear source images, the correct OCR language and careful review make a larger difference than repeatedly running recognition on a poor scan.');

export default function ImproveIndianLanguageOcrGuide() {
  return <GuideArticle
    slug="improve-ocr-indian-languages"
    eyebrow="OCR quality guide"
    title="How to improve OCR for Telugu, Hindi and other Indian-language scans"
    summary="Clear source images, the correct OCR language and careful review make a larger difference than repeatedly running recognition on a poor scan."
    readTime="7 minute guide"
    datePublished="2026-08-13"
    sections={[
      { title: 'Use the matching installed language', paragraphs: ['Indian scripts have character shapes and joining behaviour that differ from English. Choose the actual document language when it is available in the processing service.', 'For mixed-language pages, include English only when the workflow supports combined language settings and the page genuinely contains English text.'] },
      { title: 'Improve the scan before recognition', paragraphs: ['Straight pages with even lighting and good contrast give the OCR engine clearer character boundaries. Crop unrelated backgrounds and avoid heavy image compression before recognition.', 'For printed documents, a practical 200–300 DPI source is often a good starting point. More pixels do not compensate for blur or motion.'] },
      { title: 'Watch for visually similar characters and numbers', paragraphs: ['OCR mistakes often concentrate around small diacritics, punctuation, numerals and characters touching background lines. Tables and stamps can also interfere with segmentation.', 'Review identifiers, dates, amounts and names against the original scan.'] },
      { title: 'Treat handwriting separately', paragraphs: ['Printed-text OCR and handwriting recognition are different problems. Neat handwriting can still be difficult, especially when characters overlap or the page has ruled lines.', 'Use handwriting-specific workflows when available and expect more manual review than with clean printed text.'] },
    ]}
    checklist={['Choose the actual script language', 'Scan straight and evenly lit', 'Prefer clear 200–300 DPI sources', 'Manually verify names, numbers and totals']}
    relatedTools={[
      { href: '/image-to-text', title: 'Image to Text', description: 'Extract text from supported images with OCR.' },
      { href: '/scanned-pdf-to-text', title: 'Scanned PDF to Text', description: 'Recognize text from scanned PDF pages.' },
      { href: '/handwriting-image-to-text', title: 'Handwriting Image to Text', description: 'Use the handwriting-focused OCR workflow.' },
    ]}
  />;
}
