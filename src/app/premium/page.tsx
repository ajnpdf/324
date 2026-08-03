import Link from 'next/link';
import { SubscriptionCheckoutButton } from '@/components/subscriptions/subscription-checkout-button';

export const metadata = {
  title: 'AJN PDF Premium',
  description: 'Remove ads and unlock higher limits across AJN PDF.',
};

const benefits = [
  'No display ads while signed in',
  'Higher file-size limits',
  'Priority cloud processing for supported tools',
  'Batch workflows and premium workspace',
  'Subscription status shared with Android and Windows',
];

export default function PremiumPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm text-blue-300">Ã¢â€ Â AJN PDF</Link>
        <h1 className="mt-8 text-4xl md:text-6xl font-black">AJN PDF Premium</h1>
        <p className="mt-4 max-w-2xl text-slate-300">
          Core local tools remain available. Premium removes ads and supports larger,
          account-based and cloud-assisted workflows.
        </p>

        <ul className="mt-8 grid gap-3 md:grid-cols-2">
          {benefits.map((benefit) => (
            <li key={benefit} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              Ã¢Å“â€œ {benefit}
            </li>
          ))}
        </ul>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-blue-400/30 bg-blue-500/10 p-8">
            <h2 className="text-2xl font-bold">Monthly</h2>
            <p className="mt-2 text-slate-300">Configure price in the Razorpay plan.</p>
            <div className="mt-6">
              <SubscriptionCheckoutButton planKey="pro_monthly">
                Subscribe monthly
              </SubscriptionCheckoutButton>
            </div>
          </section>

          <section className="rounded-3xl border border-amber-400/30 bg-amber-500/10 p-8">
            <h2 className="text-2xl font-bold">Yearly</h2>
            <p className="mt-2 text-slate-300">Configure price in the Razorpay plan.</p>
            <div className="mt-6">
              <SubscriptionCheckoutButton planKey="pro_yearly">
                Subscribe yearly
              </SubscriptionCheckoutButton>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}