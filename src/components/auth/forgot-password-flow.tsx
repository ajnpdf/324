"use client";

import { useState, useRef, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, CheckCircle2, ArrowRight, Loader2, KeyRound } from 'lucide-react';

type Step = 'email' | 'otp' | 'reset' | 'success';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * AJN Credential Recovery Sequence
 * High-fidelity interaction for industrial account restoration.
 */
export function ForgotPasswordFlow({ open, onOpenChange }: Props) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 'otp') {
      otpRefs.current[0]?.focus();
    }
  }, [step]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 1500);
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join('').length === 6) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep('reset');
      }, 1000);
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('success');
    }, 1500);
  };

  const resetAll = () => {
    setStep('email');
    setEmail('');
    setOtp(['', '', '', '', '', '']);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-2xl border-black/5 shadow-2xl rounded-[2.5rem]">
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <DialogHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-primary/10">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-slate-950">Restore Access</DialogTitle>
              <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Enter your node email to receive a recovery key.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[9px] uppercase font-black text-slate-400 tracking-widest ml-1">Node Email</Label>
                <Input 
                  type="email" 
                  placeholder="alex@ajn.io" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="h-11 bg-black/5 border-black/5 rounded-xl font-bold"
                />
              </div>
            </div>
            <DialogFooter>
              <Button disabled={loading} className="w-full h-12 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Dispatch Key"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <DialogHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-primary/10">
                <KeyRound className="w-6 h-6 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-slate-950">Verify Identity</DialogTitle>
              <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                A 6-digit key was sent to <span className="text-slate-950 font-black">{email}</span>.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-between gap-2">
              {otp.map((digit, idx) => (
                <Input
                  key={idx}
                  ref={(el) => { otpRefs.current[idx] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  className="w-full h-14 text-center text-xl font-black bg-black/5 border-black/5 rounded-xl"
                />
              ))}
            </div>
            <div className="text-center">
              <button type="button" className="text-[9px] font-black text-primary hover:underline uppercase tracking-widest">Resend key in 0:59</button>
            </div>
            <DialogFooter>
              <Button 
                disabled={otp.join('').length < 6 || loading} 
                className="w-full h-12 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Identity"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetSubmit} className="space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-slate-950">New Access Key</DialogTitle>
              <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Establish a secure secondary credential.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[9px] uppercase font-black text-slate-400 tracking-widest ml-1">New Key</Label>
                <Input type="password" placeholder="••••••••" required className="h-11 bg-black/5 border-black/5 rounded-xl font-bold" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] uppercase font-black text-slate-400 tracking-widest ml-1">Confirm Key</Label>
                <Input type="password" placeholder="••••••••" required className="h-11 bg-black/5 border-black/5 rounded-xl font-bold" />
              </div>
            </div>
            <DialogFooter>
              <Button disabled={loading} className="w-full h-12 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Establish Credentials"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === 'success' && (
          <div className="space-y-8 py-4 text-center">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-950">Synchronization Success</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-8">Your node security has been updated. You can now re-enter the network.</p>
            </div>
            <Button onClick={resetAll} className="w-full h-14 bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl gap-3">
              Enter Nexus <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
