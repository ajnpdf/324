import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function credential() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return applicationDefault();

  const value = JSON.parse(raw);
  if (typeof value.private_key === 'string') {
    value.private_key = value.private_key.replace(/\\n/g, '\n');
  }
  return cert(value);
}

const app =
  getApps()[0] ??
  initializeApp({
    credential: credential(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
