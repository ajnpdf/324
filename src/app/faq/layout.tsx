import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Find answers about AJN PDF tools, browser processing, supported files, privacy and downloads.',
  alternates: { canonical: '/faq' },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
