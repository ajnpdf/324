import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security and File Privacy',
  description: 'Learn how AJN PDF processes files, protects browser sessions and approaches document security.',
  alternates: { canonical: '/security' },
};

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
