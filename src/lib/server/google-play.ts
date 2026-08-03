import crypto from 'crypto';
import { google } from 'googleapis';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from './firebase-admin';

const productIds = new Set([
  process.env.GOOGLE_PLAY_PRODUCT_MONTHLY || 'ajn_pdf_premium_monthly',
  process.env.GOOGLE_PLAY_PRODUCT_YEARLY || 'ajn_pdf_premium_yearly',
]);

function serviceAccount() {
  const raw = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON is missing.');

  const value = JSON.parse(raw);
  if (typeof value.private_key === 'string') {
    value.private_key = value.private_key.replace(/\\n/g, '\n');
  }
  return value;
}

export function purchaseDocumentId(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function verifyGooglePlayPurchase(purchaseToken: string) {
  const packageName = process.env.GOOGLE_PLAY_PACKAGE_NAME || 'com.ajnpdf.app';
  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount(),
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });

  const publisher = google.androidpublisher({ version: 'v3', auth });
  const response = await publisher.purchases.subscriptionsv2.get({
    packageName,
    token: purchaseToken,
  });

  const data = response.data;
  const purchasedProducts =
    data.lineItems?.map((item) => item.productId).filter((id): id is string => Boolean(id)) || [];

  if (!purchasedProducts.some((id) => productIds.has(id))) {
    throw new Error('This is not an AJN PDF subscription.');
  }

  const activeStates = new Set([
    'SUBSCRIPTION_STATE_ACTIVE',
    'SUBSCRIPTION_STATE_IN_GRACE_PERIOD',
  ]);

  return {
    active: activeStates.has(data.subscriptionState || ''),
    state: data.subscriptionState || 'SUBSCRIPTION_STATE_UNSPECIFIED',
    productIds: purchasedProducts,
    expiresAt: data.lineItems?.[0]?.expiryTime || null,
  };
}

export async function saveGooglePlayEntitlement(uid: string, purchaseToken: string) {
  const verified = await verifyGooglePlayPurchase(purchaseToken);
  const purchaseId = purchaseDocumentId(purchaseToken);

  await adminDb.runTransaction(async (transaction) => {
    transaction.set(
      adminDb.collection('playPurchases').doc(purchaseId),
      {
        uid,
        purchaseToken,
        productIds: verified.productIds,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    transaction.set(
      adminDb.collection('entitlements').doc(uid),
      {
        active: verified.active,
        tier: verified.active ? 'pro' : 'free',
        provider: 'google_play',
        providerStatus: verified.state,
        productIds: verified.productIds,
        expiresAt: verified.expiresAt,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  });

  return verified;
}
