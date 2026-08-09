import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OCR and Digital Archiving',
  description: 'Learn how OCR helps make scanned documents searchable and useful for digital archives.',
  alternates: { canonical: '/blog/ocr-digital-archiving' },
  openGraph: { type: 'article', url: '/blog/ocr-digital-archiving', title: 'OCR and Digital Archiving', description: 'Learn how OCR helps make scanned documents searchable and useful for digital archives.' },
};

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
