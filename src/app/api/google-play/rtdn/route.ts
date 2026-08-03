import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebase-admin';
import {
  purchaseDocumentId,
  saveGooglePlayEntitlement,
} from '@/lib/server/google-play';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const supplied = new URL(request.url).searchParams.get('token');
  const expected = process.env.GOOGLE_PLAY_RTDN_SHARED_SECRET;
  if (!expected || supplied !== expected) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const envelope = await request.json();
  const encoded = envelope?.message?.data;
  if (!encoded) return NextResponse.json({ received: true, ignored: true });

  const notification = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
  const purchaseToken = notification.subscriptionNotification?.purchaseToken;
  if (!purchaseToken) return NextResponse.json({ received: true, ignored: true });

  const purchase = await adminDb
    .collection('playPurchases')
    .doc(purchaseDocumentId(purchaseToken))
    .get();

  const uid = purchase.data()?.uid;
  if (!uid) return NextResponse.json({ received: true, pendingMapping: true });

  await saveGooglePlayEntitlement(uid, purchaseToken);
  return NextResponse.json({ received: true });
}
