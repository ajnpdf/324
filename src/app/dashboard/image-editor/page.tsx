import { redirect } from 'next/navigation';

/**
 * Redirecting decommissioned node to tool hub.
 */
export default function DeletedPage() { 
  redirect('/pdf-tools'); 
}
