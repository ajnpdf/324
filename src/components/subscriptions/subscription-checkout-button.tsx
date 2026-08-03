'use client';

import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open(): void };
  }
}

export function SubscriptionCheckoutButton({
  planKey,
  children,
}: {
  planKey: 'pro_monthly' | 'pro_yearly';
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function startCheckout() {
    setLoading(true);
    try {
      const user = getAuth().currentUser;
      if (!user) {
        window.location.href = '/login?next=/premium';
        return;
      }

      const token = await user.getIdToken();
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planKey }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to create subscription.');

      if (!window.Razorpay) throw new Error('Razorpay Checkout did not load.');

      const checkout = new window.Razorpay({
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: 'AJN PDF',
        description: data.title,
        image: 'https://www.ajnpdf.com/logo.jpeg',
        handler: () => {
          toast({
            title: 'Subscription authorised',
            description: 'Premium activates after secure webhook verification.',
          });
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
        theme: { color: '#1d4ed8' },
      });

      checkout.open();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Checkout unavailable',
        description: error instanceof Error ? error.message : 'Unknown checkout error.',
      });
      setLoading(false);
    }
  }

  return (
    <Button onClick={startCheckout} disabled={loading} className="w-full">
      {loading ? 'Opening secure checkoutÃ¢â‚¬Â¦' : children}
    </Button>
  );
}