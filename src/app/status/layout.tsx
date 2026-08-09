import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Service Status',
  description: 'Check AJN PDF browser workflow availability and the current server-assisted conversion service status.',
  alternates: { canonical: '/status' },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
