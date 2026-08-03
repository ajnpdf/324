"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirecting Legacy AJN route to Root Hub.
 */
export default function AJNRedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null;
}
