import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function resolveCredential() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    return applicationDefault();
  }

  const parsed = JSON.parse(raw);
  if (typeof parsed.private_key === 'string') {
    parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
  }
  return cert(parsed);
}

const app =
  getApps()[0] ??
  initializeApp({
    credential: resolveCredential(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);