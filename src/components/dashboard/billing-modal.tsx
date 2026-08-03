
"use client";

import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Lock, ShieldCheck, Zap, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BillingModal({ open, onOpenChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'plans' | 'payment'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<'PRO' | 'BUSINESS'>('PRO');

  const plans = {
    PRO: { price: '$12', features: ['2GB Max File', 'Unlimited Tasks', '50GB Storage', 'Priority Queue'] },
    BUSINESS: { price: '$49', features: ['10GB Max File', 'Team Management', '500GB/User', 'API Access'] },
  };

  const handleUpgrade = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    onOpenChange(false);
    setStep('plans');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card/95 backdrop-blur-3xl border-white/10 p-0 overflow-hidden">
        <div className="flex flex-col">
          <div className="p-8 bg-brand-gradient relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
              <Zap className="w-32 h-32 text-white" />
            </div>
            <div className="relative z-10 space-y-2">
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Unlock Unlimited Power</h2>
              <p className="text-white/80 font-medium text-sm">Elevate your workspace with premium file intelligence.</p>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {step === 'plans' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {(['PRO', 'BUSINESS'] as const).map((p) => (
                    <div 
                      key={p}
                      onClick={() => setSelectedPlan(p)}
                      className={cn(
                        "p-6 rounded-3xl border-2 cursor-pointer transition-all relative group",
                        selectedPlan === p ? "border-primary bg-primary/5 shadow-xl" : "border-white/5 bg-white/5 hover:border-white/20"
                      )}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <Badge className={cn("text-[8px] font-black tracking-widest border-none", p === 'PRO' ? "bg-blue-500" : "bg-amber-500")}>{p}</Badge>
                        <p className="text-xl font-black">{plans[p].price}<span className="text-[10px] text-muted-foreground font-bold">/mo</span></p>
                      </div>
                      <ul className="space-y-2">
                        {plans[p].features.slice(0, 3).map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                            <Check className="w-3 h-3 text-emerald-500" /> {f}
                          </li>
                        ))}
                      </ul>
                      {selectedPlan === p && <div className="absolute top-2 right-2"><Check className="w-4 h-4 text-primary" /></div>}
                    </div>
                  ))}
                </div>

                <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-[10px] text-muted-foreground font-bold leading-relaxed">
                    Subscription includes 256-bit encryption, dedicated priority processing, and 99.9% uptime SLA.
                  </p>
                </div>

                <Button onClick={() => setStep('payment')} className="w-full h-14 bg-brand-gradient hover:opacity-90 font-black text-sm shadow-xl shadow-primary/20 rounded-2xl uppercase tracking-widest">
                  Continue to Checkout
                </Button>
              </>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <h3 className="font-black text-sm uppercase tracking-widest">Secure Checkout</h3>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold border-white/10 uppercase">{selectedPlan} Plan</Badge>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Card Information</Label>
                    <div className="relative">
                      <Input placeholder="•••• •••• •••• ••••" className="h-12 bg-white/5 border-white/10 pl-12 font-mono" />
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Expiry</Label>
                      <Input placeholder="MM / YY" className="h-12 bg-white/5 border-white/10 font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground ml-1">CVC</Label>
                      <Input placeholder="•••" className="h-12 bg-white/5 border-white/10 font-mono" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-6 opacity-40 grayscale">
                  <ShieldCheck className="w-10 h-10" />
                  <span className="font-bold text-xs uppercase tracking-widest">SSL Secured</span>
                  <Lock className="w-10 h-10" />
                </div>

                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setStep('plans')} className="flex-1 h-12 font-bold uppercase text-[10px]">Back</Button>
                  <Button disabled={loading} onClick={handleUpgrade} className="flex-[2] h-12 bg-primary hover:bg-primary/90 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete Payment"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
