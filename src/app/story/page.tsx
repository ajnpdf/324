"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirecting standalone Story route to consolidated Insights & Story node.
 */
export default function StoryRedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/blog');
  }, [router]);

  return null;
}
