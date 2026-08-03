
"use client";

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Redirecting legacy Services route to the new Junction Network hub.
 */
export default function ServicesPage() {
  useEffect(() => {
    redirect('/junction');
  }, []);
  
  return null;
}
