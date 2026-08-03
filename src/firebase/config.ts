function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required Firebase environment variable: ${name}`);
  }
  return value;
}

export const firebaseConfig = {
  apiKey: required('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: required('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: required('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: required('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: required('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: required('NEXT_PUBLIC_FIREBASE_APP_ID'),
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || undefined,
};