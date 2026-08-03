
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
import { Badge } from '@/components/ui/badge';
import { Zap, AlertTriangle, ArrowRight, ShieldCheck, HardDrive, Files } from 'lucide-react';
import { BillingModal } from './billing-modal';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: 'size' | 'task' | 'storage' | 'ai';
}

export function TierGateModal({ open, onOpenChange, reason }: Props) {
  const [showBilling, setShowBilling] = useState(false);

  const content = {
    size: {
      icon: HardDrive,
      title: 'File Size Exceeded',
      desc: 'This file is larger than the 50MB limit for Free workspaces. Pro users can upload files up to 2GB.',
      color: 'text-amber-500'
    },
    task: {
      icon: Files,
      title: 'Daily Limit Reached',
      desc: 'You\'ve used all 10 daily tasks. Your limit will reset in 14 hours, or you can go Pro for unlimited conversions.',
      color: 'text-blue-500'
    },
    storage: {
      icon: AlertTriangle,
      title: 'Workspace Full',
      desc: 'Your 500MB workspace is full. Free tier files are kept for 24 hours, or you can expand to 50GB with Pro.',
      color: 'text-red-500'
    },
    ai: {
      icon: Zap,
      title: 'AI Credits Depleted',
      desc: 'You\'ve used your 3 monthly AI credits. Business users get unlimited intelligence credits.',
      color: 'text-purple-500'
    }
  };

  const active = content[reason];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-3xl border-white/10">
          <div className="py-6 flex flex-col items-center text-center space-y-6">
            <div className={`w-20 h-20 bg-white/5 rounded-[2.5rem] border-2 border-white/10 flex items-center justify-center ${active.color}`}>
              <active.icon className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary">Free Tier Limit</Badge>
              <h2 className="text-2xl font-black tracking-tight uppercase">{active.title}</h2>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed px-4">
                {active.desc}
              </p>
            </div>

            <div className="w-full space-y-3 pt-4">
              <Button 
                onClick={() => { onOpenChange(false); setShowBilling(true); }}
                className="w-full h-14 bg-brand-gradient hover:opacity-90 font-black text-sm shadow-2xl shadow-primary/20 rounded-2xl gap-3"
              >
                UPGRADE TO PRO <ArrowRight className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => onOpenChange(false)}
                className="w-full h-10 font-bold uppercase text-[10px] text-muted-foreground"
              >
                Dismiss for now
              </Button>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-tighter">Verified Secure Subscription Flow</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <BillingModal open={showBilling} onOpenChange={setShowBilling} />
    </>
  );
}
