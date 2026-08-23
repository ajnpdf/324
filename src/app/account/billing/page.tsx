'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock3, CreditCard, Loader2, ReceiptText } from 'lucide-react';
import { Navbar } from '@/components/landing/navbar';
import { useAuth } from '@/lib/auth-context';

type BillingRow = {
  order_reference?: string | null;
  payment_reference?: string | null;
  receipt?: string | null;
  plan?: string;
  amount?: number;
  currency?: string;
  status?: string;
  fulfilled?: boolean;
  created_at?: string | null;
  paid_at?: string | null;
  valid_until?: string | null;
};

function money(paise: number, currency = 'INR') {
  if (currency === 'INR') return `₹${(Math.max(0, paise) / 100).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  return `${currency} ${(Math.max(0, paise) / 100).toFixed(2)}`;
}

function date(value?: string | null) {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toLocaleString() : '—';
}

function planName(value?: string) {
  if (value === 'premium_30d') return 'Premium · 30 days';
  if (value === 'premium_365d') return 'Premium · 365 days';
  return value || 'AJN PDF plan';
}

export default function AccountBillingPage() {
  const auth = useAuth();
  const [rows, setRows] = useState<BillingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (auth.loading) return;
      if (!auth.session) { setLoading(false); return; }
      setLoading(true); setError('');
      try {
        const token = await auth.getIdToken();
        if (!token) throw new Error('Your AJN session expired. Sign in again.');
        const response = await fetch('/api/billing/history', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(String(payload?.error || 'Billing history could not be loaded.'));
        if (!cancelled) setRows(Array.isArray(payload?.orders) ? payload.orders : []);
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'Billing history could not be loaded.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [auth]);

  return <div className="min-h-screen bg-slate-50"><Navbar/><main className="mx-auto max-w-6xl px-4 pb-20 pt-[104px] md:px-8 md:pt-[120px]"><Link href="/account" className="inline-flex items-center gap-2 text-xs font-black text-slate-600 hover:text-violet-700"><ArrowLeft className="h-4 w-4"/>Back to account</Link><div className="mt-5 rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-violet-700">Billing</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Payments & Premium history</h1><p className="mt-3 max-w-2xl text-xs font-medium leading-5 text-slate-600">This view comes from your server-side AJN PDF billing orders. References are masked and no Razorpay secret is exposed.</p></div><Link href="/pricing" className="inline-flex min-h-11 items-center rounded-xl bg-violet-700 px-4 text-xs font-black text-white">View plans</Link></div>

  {auth.loading || loading ? <div className="mt-8 flex items-center gap-2 rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-600"><Loader2 className="h-4 w-4 animate-spin"/>Loading verified billing history…</div> : !auth.session ? <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="text-sm font-black text-amber-900">Sign in to view your billing history.</p><Link href="/login" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-violet-700 px-4 text-xs font-black text-white">Sign in</Link></div> : error ? <p role="alert" className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-xs font-bold leading-5 text-red-800">{error}</p> : rows.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><ReceiptText className="mx-auto h-7 w-7 text-slate-400"/><p className="mt-3 text-sm font-black text-slate-700">No billing orders found for this account.</p></div> : <div className="mt-8 space-y-3">{rows.map((row, index) => <article key={`${row.order_reference || 'order'}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-violet-700"/><h2 className="text-sm font-black text-slate-950">{planName(row.plan)}</h2></div><p className="mt-2 text-2xl font-black text-slate-950">{money(Number(row.amount || 0), row.currency || 'INR')}</p></div><span className={`rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-wider ${row.fulfilled ? 'bg-emerald-100 text-emerald-800' : row.status === 'created' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'}`}>{row.fulfilled ? 'Premium fulfilled' : row.status || 'created'}</span></div><div className="mt-4 grid gap-3 text-[10px] font-semibold text-slate-600 sm:grid-cols-2 lg:grid-cols-4"><div><span className="block font-black uppercase tracking-wider text-slate-400">Created</span><span className="mt-1 block">{date(row.created_at)}</span></div><div><span className="block font-black uppercase tracking-wider text-slate-400">Paid</span><span className="mt-1 block">{date(row.paid_at)}</span></div><div><span className="block font-black uppercase tracking-wider text-slate-400">Premium until</span><span className="mt-1 block">{date(row.valid_until)}</span></div><div><span className="block font-black uppercase tracking-wider text-slate-400">Reference</span><span className="mt-1 block break-all">{row.payment_reference || row.order_reference || row.receipt || '—'}</span></div></div>{row.fulfilled ? <div className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-[10px] font-bold leading-4 text-emerald-800"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0"/>This order is recorded as fulfilled in AJN PDF billing storage.</div> : <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-[10px] font-bold leading-4 text-amber-800"><Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0"/>An order record is not the same as a successful payment. Premium is active only after verified capture and fulfillment.</div>}</article>)}</div>}
  </div></main></div>;
}
