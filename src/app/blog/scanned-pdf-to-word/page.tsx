import { GuideArticle } from '@/components/blog/guide-article';
import { guideMetadata } from '@/lib/guide-metadata';

export const metadata = guideMetadata('scanned-pdf-to-word', 'How to convert a scanned PDF to editable Word text', 'A scanned PDF needs OCR before its visible text can become editable Word content, and the converted document should always be reviewed.');

export default function ScannedPdfToWordGuide() {
  return <GuideArticle
    slug="scanned-pdf-to-word"
    eyebrow="Conversion guide"
    title="How to convert a scanned PDF to editable Word text"
    summary="A scanned PDF needs OCR before its visible text can become editable Word content, and the converted document should always be reviewed."
    readTime="6 minute guide"
    datePublished="2026-08-13"
    sections={[
      { title: 'Confirm the PDF is really image-only', paragraphs: ['Try selecting a sentence in a PDF viewer. If the page is only a scan, there may be no usable text layer even though the document looks normal.', 'A normal PDF-to-Word converter cannot recover text that does not exist as text. OCR is the required first step.'] },
      { title: 'Run OCR with the correct language', paragraphs: ['Choose the document language and use the clearest scan available. Multi-page documents should be checked for rotation and pages with very different scan quality.', 'The OCR stage produces recognized text that can then be placed into an editable document structure.'] },
      { title: 'Expect layout reconstruction rather than a perfect clone', paragraphs: ['Word documents are editable and reflowable, while a scan represents fixed page pixels. Tables, columns, stamps and handwritten notes may need manual adjustment.', 'The goal should be usable editable content, not a promise of pixel-identical layout.'] },
      { title: 'Validate before sending or editing further', paragraphs: ['Compare important sections with the original scan, especially names, numbers and tables. Keep the source PDF until the editable copy has been checked.', 'After editing, export back to PDF only when you need a stable final presentation.'] },
    ]}
    checklist={['Check whether text is selectable', 'Choose the correct OCR language', 'Review tables and numbers', 'Keep the original scan']}
    relatedTools={[
      { href: '/scanned-pdf-to-word', title: 'Scanned PDF to Word', description: 'OCR a supported scanned PDF and create editable Word output.' },
      { href: '/scanned-pdf-to-text', title: 'Scanned PDF to Text', description: 'Extract plain OCR text for simpler workflows.' },
      { href: '/word-to-pdf', title: 'Word to PDF', description: 'Create a PDF after editing the Word document.' },
    ]}
  />;
}
