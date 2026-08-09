import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About AJN PDF',
  description: 'Learn how AJN PDF combines browser workflows with clearly labelled temporary server processing for PDF, OCR, image and document tools.',
  alternates: { canonical: '/about' },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
