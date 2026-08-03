import crypto from 'crypto';
import { google } from 'googleapis';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from './firebase-admin';
import { PLAY_PRODUCT_IDS } from '../subscription-plans';

function credentials() {
  const raw = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON is missing.');
  const parsed = JSON.parse(raw);
  if (typeof parsed.private_key === 'string') {
    parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
  }
  return parsed;
}

export function purchaseDocumentId(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function verifyPlaySubscription(purchaseToken: string) {
  const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME;
  if (!packageName) throw new Error('GOOGLE_PLAY_PACKAGE_NAME is missing.');

  const auth = new google.auth.GoogleAuth({
    credentials: credentials(),
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });

  const publisher = google.androidpublisher({ version: 'v3', auth });
  const response = await publisher.purchases.subscriptionsv2.get({
    packageName,
    token: purchaseToken,
  });

  const data = response.data;
  const productIds =
    data.lineItems?.map((item) => item.productId).filter((value): value is string => Boolean(value)) || [];

  if (!productIds.some((id) => PLAY_PRODUCT_IDS.has(id))) {
    throw new Error('The purchase does not contain an AJN PDF subscription product.');
  }

  const activeStates = new Set([
    'SUBSCRIPTION_STATE_ACTIVE',
    'SUBSCRIPTION_STATE_IN_GRACE_PERIOD',
  ]);

  return {
    active: activeStates.has(data.subscriptionState || ''),
    state: data.subscriptionState || 'SUBSCRIPTION_STATE_UNSPECIFIED',
    productIds,
    expiryTime: data.lineItems?.[0]?.expiryTime || null,
    raw: data,
  };
}

export async function persistPlayEntitlement(uid: string, purchaseToken: string) {
  const verified = await verifyPlaySubscription(purchaseToken);
  const purchaseId = purchaseDocumentId(purchaseToken);

  await adminDb.runTransaction(async (tx) => {
    tx.set(
      adminDb.collection('playPurchases').doc(purchaseId),
      {
        uid,
        purchaseToken,
        productIds: verified.productIds,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    tx.set(
      adminDb.collection('entitlements').doc(uid),
      {
        active: verified.active,
        tier: verified.active ? 'pro' : 'free',
        provider: 'google_play',
        productIds: verified.productIds,
        providerStatus: verified.state,
        expiresAt: verified.expiryTime,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  });

  return verified;
}