
import { permanentRedirect } from 'next/navigation';

/**
 * AJN Legacy Tool Redirect Node - SEO Hardened v5.0
 * Consolidates all tool traffic to the root slug path via 301 (Permanent) Redirect.
 * Fixed: Explicitly returning status 301 for industrial crawling.
 */
export default async function ToolPageRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Permanent 301 (Redirect) to canonical path at root
  permanentRedirect(`/${id}`);
  
  return null;
}
