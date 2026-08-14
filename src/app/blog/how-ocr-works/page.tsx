import { GuideArticle } from '@/components/blog/guide-article';
import { guideMetadata } from '@/lib/guide-metadata';

export const metadata = guideMetadata('how-ocr-works', 'How OCR works on scanned PDFs and images', 'Optical character recognition turns visible letter shapes into machine-readable text, but output quality depends heavily on the source image and language settings.');

export default function HowOcrWorksGuide() {
  return <GuideArticle
    slug="how-ocr-works"
    eyebrow="OCR guide"
    title="How OCR works on scanned PDFs and images"
    summary="Optical character recognition turns visible letter shapes into machine-readable text, but output quality depends heavily on the source image and language settings."
    readTime="6 minute guide"
    datePublished="2026-08-13"
    sections={[
      { title: 'A scan is not automatically searchable text', paragraphs: ['A photographed or scanned page can look like a normal document while containing only pixels. Search, copy and text extraction require either an embedded text layer or OCR.', 'OCR examines the image and estimates the characters and words that those pixels represent.'] },
      { title: 'Language selection matters', paragraphs: ['OCR engines use language models and trained character data to distinguish similar shapes. Selecting the correct language helps with regional scripts, punctuation and common word patterns.', 'AJN PDF documents supported OCR languages from the active processing service rather than claiming every language is installed.'] },
      { title: 'Image quality affects recognition', paragraphs: ['Blur, shadows, compression artifacts, skew and very small text make recognition harder. A clean scan around a practical reading resolution is usually more reliable than a dark phone photo taken at an angle.', 'Rotation detection can help, but manual correction may still improve difficult pages.'] },
      { title: 'Review OCR before important use', paragraphs: ['Names, account numbers, totals, dates and legal clauses deserve manual checking. OCR output should be treated as extracted text that may contain recognition errors, not as an authoritative transcription.', 'For searchable PDFs, also confirm that the visible page and hidden text layer align well enough for search and selection.'] },
    ]}
    checklist={['Select the correct language', 'Use a clear, straight scan', 'Check names and numbers manually', 'Verify searchable text alignment']}
    relatedTools={[
      { href: '/scanned-pdf-to-text', title: 'Scanned PDF to Text', description: 'Extract OCR text from supported scanned PDFs.' },
      { href: '/image-to-text', title: 'Image to Text', description: 'Recognize text in supported image files.' },
      { href: '/scanned-pdf-to-searchable-pdf', title: 'Searchable PDF', description: 'Create a searchable text layer for a scan.' },
    ]}
  />;
}
