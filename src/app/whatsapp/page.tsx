"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * AJN WhatsApp Node - Decommissioned
 * This route has been retired from the network.
 */
export default function WhatsAppPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null;
}
