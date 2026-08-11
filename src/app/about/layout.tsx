import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About AJN PDF',
  description: 'Learn how AJN PDF brings PDF, OCR, image and document workflows together in a clear, focused web workspace.',
  alternates: { canonical: '/about' },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
