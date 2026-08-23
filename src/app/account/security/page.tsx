'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, LogOut, ShieldCheck, Trash2 } from 'lucide-react';
import { Navbar } from '@/components/landing/navbar';
import { useAuth } from '@/lib/auth-context';
import { sendPasswordReset } from '@/lib/firebase-rest';

export default function AccountSecurityPage() {
  const auth = useAuth();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const resetPassword = async () => {
    if (!auth.session?.email || sending) return;
    setSending(true); setMessage(''); setError('');
    try {
      await sendPasswordReset(auth.session.email);
      setMessage(`Password-reset instructions were requested for ${auth.session.email}. Check the inbox and spam folder.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Password reset could not be requested.');
    } finally { setSending(false); }
  };

  return <div className="min-h-screen bg-slate-50"><Navbar/><main className="mx-auto max-w-4xl px-4 pb-20 pt-[104px] md:px-8 md:pt-[120px]"><Link href="/account" className="inline-flex items-center gap-2 text-xs font-black text-slate-600 hover:text-violet-700"><ArrowLeft className="h-4 w-4"/>Back to account</Link><div className="mt-5 rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><ShieldCheck className="h-5 w-5"/></span><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-violet-700">Security</p><h1 className="mt-1 text-2xl font-black text-slate-950">Sign-in and account controls</h1></div></div>

  {auth.loading ? <div className="mt-8 flex items-center gap-2 rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-600"><Loader2 className="h-4 w-4 animate-spin"/>Loading account…</div> : !auth.session ? <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="text-sm font-black text-amber-900">Sign in to manage account security.</p><Link href="/login" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-violet-700 px-4 text-xs font-black text-white">Sign in</Link></div> : <div className="mt-8 space-y-4">
    <section className="rounded-2xl border border-slate-200 p-5"><KeyRound className="h-5 w-5 text-violet-700"/><h2 className="mt-3 text-sm font-black text-slate-950">Password reset</h2><p className="mt-2 text-xs font-medium leading-5 text-slate-600">Request Firebase password-reset instructions for <span className="font-black text-slate-800">{auth.session.email}</span>. Google-only accounts may continue using Google sign-in instead.</p><button type="button" onClick={() => void resetPassword()} disabled={sending} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-violet-700 px-4 text-xs font-black text-white disabled:opacity-50">{sending ? <Loader2 className="h-4 w-4 animate-spin"/> : <KeyRound className="h-4 w-4"/>}{sending ? 'Requesting…' : 'Send reset email'}</button>{message ? <p role="status" className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold leading-5 text-emerald-800"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0"/>{message}</p> : null}{error ? <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold leading-5 text-red-800">{error}</p> : null}</section>

    <section className="rounded-2xl border border-slate-200 p-5"><LogOut className="h-5 w-5 text-slate-700"/><h2 className="mt-3 text-sm font-black text-slate-950">Current session</h2><p className="mt-2 text-xs font-medium leading-5 text-slate-600">AJN PDF can end the current browser session now. Multi-device session revocation is not claimed in this release.</p><button type="button" onClick={auth.signOut} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 hover:bg-slate-50"><LogOut className="h-4 w-4"/>Sign out this browser</button></section>

    <section className="rounded-2xl border border-red-200 bg-red-50/50 p-5"><Trash2 className="h-5 w-5 text-red-700"/><h2 className="mt-3 text-sm font-black text-red-950">Data deletion</h2><p className="mt-2 text-xs font-medium leading-5 text-red-900/70">Use the documented AJN PDF data-deletion process. This page does not pretend to delete Firebase or billing records without the required backend workflow.</p><Link href="/data-deletion" className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-red-200 bg-white px-4 text-xs font-black text-red-800">Open data-deletion instructions</Link></section>
  </div>}
  </div></main></div>;
}
