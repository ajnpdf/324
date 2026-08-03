import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { z } from 'zod';
import { requireUser } from '@/lib/server/require-user';
import { WEB_PLANS, type WebPlanKey } from '@/lib/subscription-plans';

export const runtime = 'nodejs';

const bodySchema = z.object({
  planKey: z.enum(['pro_monthly', 'pro_yearly']),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const { planKey } = bodySchema.parse(await request.json());
    const plan = WEB_PLANS[planKey as WebPlanKey];

    if (!plan.planId) {
      return NextResponse.json(
        { error: `Razorpay plan is not configured: ${planKey}` },
        { status: 503 },
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay is not configured.' }, { status: 503 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const subscription = await razorpay.subscriptions.create({
      plan_id: plan.planId,
      total_count: plan.totalCount,
      quantity: 1,
      customer_notify: true,
      notes: {
        firebaseUid: user.uid,
        planKey,
      },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId,
      planKey,
      title: plan.title,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message === 'UNAUTHENTICATED' ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}