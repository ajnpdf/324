import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/server/firebase-admin';

export const runtime = 'nodejs';

function safeEqualHex(left: string, right: string) {
  if (!/^[a-f0-9]+$/i.test(left) || !/^[a-f0-9]+$/i.test(right)) return false;
  const a = Buffer.from(left, 'hex');
  const b = Buffer.from(right, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook is not configured.' }, { status: 503 });
  }

  const raw = await request.text();
  const signature = request.headers.get('x-razorpay-signature') || '';
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');

  if (!safeEqualHex(signature, expected)) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  const event = JSON.parse(raw);
  const eventId = String(event.id || crypto.createHash('sha256').update(raw).digest('hex'));
  const subscription = event.payload?.subscription?.entity;
  const uid = subscription?.notes?.firebaseUid;
  const planKey = subscription?.notes?.planKey;

  if (!uid || !planKey) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const activeEvents = new Set([
    'subscription.activated',
    'subscription.charged',
    'subscription.resumed',
  ]);
  const inactiveEvents = new Set([
    'subscription.cancelled',
    'subscription.completed',
    'subscription.halted',
    'subscription.paused',
  ]);

  await adminDb.runTransaction(async (tx) => {
    const eventRef = adminDb.collection('subscriptionEvents').doc(eventId);
    const previous = await tx.get(eventRef);
    if (previous.exists) return;

    tx.create(eventRef, {
      provider: 'razorpay',
      type: event.event,
      receivedAt: FieldValue.serverTimestamp(),
    });

    if (!activeEvents.has(event.event) && !inactiveEvents.has(event.event)) return;

    tx.set(
      adminDb.collection('entitlements').doc(uid),
      {
        active: activeEvents.has(event.event),
        tier: activeEvents.has(event.event) ? 'pro' : 'free',
        provider: 'razorpay',
        planKey,
        providerSubscriptionId: subscription.id,
        providerStatus: subscription.status,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  });

  return NextResponse.json({ received: true });
}