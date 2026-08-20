import type { Metadata } from 'next';
import Script from 'next/script';
import { CategoryDirectory } from '@/components/landing/category-directory';
import { SITE_URL } from '@/lib/seo-config';

export const metadata: Metadata = {
  title: 'Free Online File Converter Tools',
  description: 'Convert PDFs, office documents, images, eBooks, email files and supported documents with clear requirements and downloadable output.',
  alternates: { canonical: '/conversion-tools' },
  keywords: ['file converter online', 'PDF converter', 'document converter', 'document converter online'],
  openGraph: { title: 'Free Online File Converter Tools | AJN PDF', description: 'Focused PDF, document and image conversion workflows.', url: '/conversion-tools', images: ['/og-image.jpg'] },
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
