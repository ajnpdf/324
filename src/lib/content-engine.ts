export type ContentBrief = {
  slug: string;
  cluster: 'core-pdf' | 'conversion' | 'ocr' | 'image' | 'security' | 'comparison';
  intent: 'informational' | 'commercial' | 'transactional-support';
  title: string;
  primaryKeyword: string;
  supportingQuestions: string[];
  relatedTools: string[];
  status: 'published' | 'planned';
};

export const CONTENT_BRIEFS: ContentBrief[] = [
  {
    slug: 'how-to-merge-pdfs-online-safely', cluster: 'core-pdf', intent: 'informational',
    title: 'How to merge PDFs online safely', primaryKeyword: 'how to merge pdf online safely',
    supportingQuestions: ['How do I keep page order correct?', 'How should I validate the downloaded PDF?'],
    relatedTools: ['merge-pdf', 'organize-pdf', 'compress-pdf'], status: 'published',
  },
  {
    slug: 'ocr-digital-archiving', cluster: 'ocr', intent: 'informational',
    title: 'OCR for scanned documents and digital archives', primaryKeyword: 'OCR scanned documents',
    supportingQuestions: ['Which OCR language should I choose?', 'How can I improve scan accuracy?'],
    relatedTools: ['scanned-pdf-to-text', 'image-to-text', 'scanned-pdf-to-searchable-pdf'], status: 'published',
  },
  {
    slug: 'pdf-to-word-layout-guide', cluster: 'conversion', intent: 'transactional-support',
    title: 'PDF to Word: what formatting can be preserved?', primaryKeyword: 'pdf to word formatting',
    supportingQuestions: ['Why do complex tables move?', 'When should OCR be used first?'],
    relatedTools: ['pdf-to-word', 'pdf-to-docx', 'scanned-pdf-to-word'], status: 'planned',
  },
  {
    slug: 'compress-pdf-quality-guide', cluster: 'core-pdf', intent: 'transactional-support',
    title: 'How to reduce PDF size without ruining readability', primaryKeyword: 'compress pdf without losing quality',
    supportingQuestions: ['Which compression level should I choose?', 'Why do scanned PDFs stay large?'],
    relatedTools: ['compress-pdf', 'pdf-to-grayscale-pdf'], status: 'planned',
  },
  {
    slug: 'image-to-pdf-file-preparation', cluster: 'image', intent: 'informational',
    title: 'Prepare JPG and PNG files before creating a PDF', primaryKeyword: 'image to pdf preparation',
    supportingQuestions: ['Which image resolution is enough?', 'How should page size and orientation be chosen?'],
    relatedTools: ['jpg-to-pdf', 'png-to-pdf', 'multiple-images-to-one-pdf'], status: 'planned',
  },
  {
    slug: 'pdf-password-permissions-explained', cluster: 'security', intent: 'informational',
    title: 'PDF open passwords, owner passwords and permissions', primaryKeyword: 'PDF password permissions',
    supportingQuestions: ['What is the difference between user and owner passwords?', 'Can printing and copying be restricted?'],
    relatedTools: ['protect-pdf', 'unlock-pdf'], status: 'planned',
  },
];

export const CONTENT_QUALITY_GATE = [
  'The page answers a real user task that is supported by a working AJN PDF tool.',
  'Examples and limitations match the actual processing engine.',
  'The article links to a focused tool and at least two relevant supporting pages.',
  'The title, heading and introduction satisfy the same search intent without keyword stuffing.',
  'Screenshots or examples are AJN-owned and are updated when the workflow changes.',
  'The page is reviewed for accuracy before it is added to the sitemap.',
] as const;
