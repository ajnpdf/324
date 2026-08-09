import type { Metadata } from 'next';
import Script from 'next/script';
import { CategoryDirectory } from '@/components/landing/category-directory';
import { SITE_URL } from '@/lib/seo-config';

export const metadata: Metadata = {
  title: 'Free Online File Converter & OCR Tools',
  description: 'Convert PDFs, office documents, images, eBooks, email files and scanned documents with clear requirements, OCR options and downloadable output.',
  alternates: { canonical: '/conversion-tools' },
  keywords: ['file converter online', 'PDF converter', 'OCR online', 'document converter', 'scanned PDF converter'],
  openGraph: { title: 'Free Online File Converter & OCR Tools | AJN PDF', description: 'Focused PDF, document, image and OCR conversion workflows.', url: '/conversion-tools', images: ['/og-image.jpg'] },
};

export default function Page() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'AJN PDF online file conversion tools',
    url: `${SITE_URL}/conversion-tools`,
    description: metadata.description,
    isPartOf: { '@type': 'WebSite', name: 'AJN PDF', url: SITE_URL },
  };
  return <><Script id="conversion-category-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><CategoryDirectory category="conversion" /></>;
}
