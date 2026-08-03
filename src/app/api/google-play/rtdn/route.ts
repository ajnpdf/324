import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/server/firebase-admin';
import { persistPlayEntitlement, purchaseDocumentId } from '@/lib/server/google-play';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const expected = process.env.GOOGLE_PLAY_RTDN_SHARED_SECRET;
  const supplied = new URL(request.url).searchParams.get('token');
  if (!expected || supplied !== expected) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const envelope = await request.json();
  const encoded = envelope?.message?.data;
  if (!encoded) return NextResponse.json({ received: true, ignored: true });

  const message = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
  const purchaseToken =
    message.subscriptionNotification?.purchaseToken ||
    message.oneTimeProductNotification?.purchaseToken;

  if (!purchaseToken) return NextResponse.json({ received: true, ignored: true });

  const purchase = await adminDb.collection('playPurchases').doc(purchaseDocumentId(purchaseToken)).get();
  const uid = purchase.data()?.uid;
  if (!uid) return NextResponse.json({ received: true, pendingMapping: true });

  await persistPlayEntitlement(uid, purchaseToken);
  return NextResponse.json({ received: true });
}