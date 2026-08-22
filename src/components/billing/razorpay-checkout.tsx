'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

type BillingPlanId = 'premium_30d' | 'premium_365d';

type RazorpayOrder = {
  key_id: string;
  order_id: string;
  amount: number;
  currency: string;
  plan: BillingPlanId;
  label: string;
};

type RazorpayResult = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open(): void };
  }
}

function loadCheckoutScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const existing = document.querySelector<HTMLScriptElement>('script[data-ajn-razorpay="checkout"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Razorpay Checkout could not load.')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.ajnRazorpay = 'checkout';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Razorpay Checkout could not load.'));
    document.head.appendChild(script);
  });
}

async function jsonResponse(response: Response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(String(payload?.error || payload?.detail || 'Billing request failed.'));
  return payload;
}

export function RazorpayCheckout({ monthlyInr, yearlyInr }: { monthlyInr: number; yearlyInr: number }) {
  const auth = useAuth();
  const [loading, setLoading] = useState<BillingPlanId | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const buy = async (plan: BillingPlanId) => {
    setError('');
    setSuccess('');
    setLoading(plan);
    try {
      const token = await auth.getIdToken();
      if (!token) throw new Error('Sign in to purchase AJN PDF Premium.');
      const order = await jsonResponse(await fetch('/api/billing/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan }),
      })) as RazorpayOrder;

      await loadCheckoutScript();
      if (!window.Razorpay) throw new Error('Razorpay Checkout is unavailable.');

      await new Promise<void>((resolve, reject) => {
        const checkout = new window.Razorpay!({
          key: order.key_id,
          amount: order.amount,
          currency: order.currency,
          name: 'AJN PDF',
          description: order.label,
          order_id: order.order_id,
          prefill: { email: auth.session?.email || '' },
          notes: { product: 'AJN PDF' },
          retry: { enabled: true },
          timeout: 600,
          handler: async (result: RazorpayResult) => {
            try {
              const currentToken = await auth.getIdToken();
              if (!currentToken) throw new Error('Your AJN session expired. Sign in again to verify the payment.');
              const verified = await jsonResponse(await fetch('/api/billing/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentToken}` },
                body: JSON.stringify(result),
              }));
              await auth.refreshPlan();
              setSuccess(`Premium activated${verified?.valid_until ? ` until ${new Date(verified.valid_until).toLocaleDateString()}` : ''}.`);
              resolve();
            } catch (reason) {
              reject(reason);
            }
          },
          modal: {
            ondismiss: () => reject(new Error('Payment window closed before completion.')),
          },
          theme: { color: '#6d28d9' },
        });
        checkout.open();
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Payment could not be completed.');
    } finally {
      setLoading(null);
    }
  };

  if (!auth.session) {
    return <div className="rounded-2xl border border-violet-200 bg-white p-4"><p className="text-xs font-bold leading-5 text-slate-600">Sign in before purchasing Premium so the verified entitlement can be attached to your AJN account.</p><Link href="/login" className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-violet-700 px-4 text-xs font-black text-white">Sign in to continue</Link></div>;
  }

  return <div className="space-y-3">
    <button type="button" disabled={Boolean(loading) || monthlyInr <= 0} onClick={() => void buy('premium_30d')} className="flex min-h-12 w-full items-center justify-between rounded-xl border border-violet-200 bg-white px-4 text-left text-xs font-black text-violet-900 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"><span>Premium · 30 days</span><span>{monthlyInr > 0 ? `₹${monthlyInr.toLocaleString('en-IN')}` : 'Not configured'}</span>{loading === 'premium_30d' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}</button>
    <button type="button" disabled={Boolean(loading) || yearlyInr <= 0} onClick={() => void buy('premium_365d')} className="flex min-h-12 w-full items-center justify-between rounded-xl bg-violet-700 px-4 text-left text-xs font-black text-white shadow-lg shadow-violet-100 hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"><span>Premium · 365 days</span><span>{yearlyInr > 0 ? `₹${yearlyInr.toLocaleString('en-IN')}` : 'Not configured'}</span>{loading === 'premium_365d' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}</button>
    <div className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-[10px] font-bold leading-4 text-emerald-800"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0"/>Payment is verified server-side and Premium activates only after Razorpay confirms capture.</div>
    {success ? <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800"><CheckCircle2 className="h-4 w-4"/>{success}</p> : null}
    {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold leading-5 text-red-800">{error}</p> : null}
  </div>;
}
