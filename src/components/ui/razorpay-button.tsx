"use client";

import React, { useState } from 'react';
import { Button } from './button';
import { CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface RazorpayButtonProps {
  amount?: number;
  label?: string;
  className?: string;
}

/**
 * AJN Industrial Payment Unit - Standard Checkout v1.1
 * Sanitized for production stability.
 */
export default function RazorpayButton({ 
  amount = 100, 
  label = "Support AJN Studio", 
  className 
}: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { data: order } = await axios.post('/api/razorpay/order', { amount });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "AJN STUDIO",
        description: "Professional Tool Support",
        image: "https://ajnpdf.com/logo.jpeg",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const { data: verification } = await axios.post('/api/razorpay/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verification.success) {
              toast({
                variant: "success",
                title: "Payment Success",
                description: "Transaction verified successfully.",
              });
            }
          } catch (err) {
            toast({
              variant: "destructive",
              title: "Verification Failed",
              description: "Integrity check failed.",
            });
          }
        },
        prefill: {
          name: "AJN User",
          email: "support@ajnpdf.com",
        },
        theme: {
          color: "#1e3a8a",
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      if ((window as any).Razorpay) {
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          toast({
            variant: "destructive",
            title: "Payment Failed",
            description: response.error.description || "The gateway rejected the transaction.",
          });
          setLoading(false);
        });
        rzp.open();
      } else {
        throw new Error("Razorpay SDK not loaded.");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Session Error",
        description: error.message || "Could not initialize payment gateway.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button 
        onClick={handlePayment} 
        disabled={loading}
        className="h-16 px-10 bg-slate-950 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/10 active:scale-95 min-w-[240px]"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <><CreditCard className="w-5 h-5" /> {label}</>
        )}
      </Button>
      <div className="flex items-center gap-2 opacity-40">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Secure Razorpay Gateway</span>
      </div>
    </div>
  );
}
