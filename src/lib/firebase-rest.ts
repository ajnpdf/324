"use client";

export type FirebaseSession = {
  idToken: string;
  refreshToken: string;
  expiresAt: number;
  localId: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
};

export type FirebaseClaims = {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  plan?: string;
  premium?: boolean;
  admin?: boolean;
  exp?: number;
  [key: string]: unknown;
};

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() || '';
export const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() || '';
export const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || '';

export const firebaseAuthConfigured = Boolean(apiKey && firebaseProjectId);
export const googleAuthConfigured = firebaseAuthConfigured && Boolean(googleClientId);

function requireConfig() {
  if (!firebaseAuthConfigured) throw new Error('Firebase Authentication is not configured for this deployment.');
}

function decodeError(payload: any, fallback: string) {
  const raw = String(payload?.error?.message || '').trim();
  const known: Record<string, string> = {
    EMAIL_EXISTS: 'An account already exists for this email.',
    EMAIL_NOT_FOUND: 'No account was found for this email.',
    INVALID_PASSWORD: 'The email or password is incorrect.',
    INVALID_LOGIN_CREDENTIALS: 'The email or password is incorrect.',
    USER_DISABLED: 'This account is disabled.',
    WEAK_PASSWORD: 'Use a stronger password with at least 6 characters.',
    TOO_MANY_ATTEMPTS_TRY_LATER: 'Too many attempts. Try again later.',
  };
  return known[raw] || raw.replaceAll('_', ' ').toLowerCase() || fallback;
}

async function identity(path: string, body: Record<string, unknown>) {
  requireConfig();
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/${path}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(decodeError(payload, 'Authentication failed.'));
  return payload;
}

function toSession(payload: any): FirebaseSession {
  const expiresIn = Math.max(60, Number(payload.expiresIn || 3600));
  return {
    idToken: String(payload.idToken || ''),
    refreshToken: String(payload.refreshToken || ''),
    expiresAt: Date.now() + expiresIn * 1000,
    localId: String(payload.localId || payload.user_id || ''),
    email: String(payload.email || ''),
    displayName: String(payload.displayName || payload.display_name || '') || undefined,
    photoUrl: String(payload.photoUrl || payload.photo_url || '') || undefined,
  };
}

export async function signUpWithEmail(email: string, password: string) {
  const payload = await identity('accounts:signUp', { email: email.trim(), password, returnSecureToken: true });
  return toSession(payload);
}

export async function signInWithEmail(email: string, password: string) {
  const payload = await identity('accounts:signInWithPassword', { email: email.trim(), password, returnSecureToken: true });
  return toSession(payload);
}

export async function sendPasswordReset(email: string) {
  await identity('accounts:sendOobCode', { requestType: 'PASSWORD_RESET', email: email.trim() });
}

export async function signInFirebaseWithGoogleIdToken(googleIdToken: string) {
  const payload = await identity('accounts:signInWithIdp', {
    postBody: `id_token=${encodeURIComponent(googleIdToken)}&providerId=google.com`,
    requestUri: typeof window === 'undefined' ? 'https://www.ajnpdf.com' : window.location.origin,
    returnIdpCredential: true,
    returnSecureToken: true,
  });
  return toSession(payload);
}

export async function refreshFirebaseSession(session: FirebaseSession): Promise<FirebaseSession> {
  requireConfig();
  if (!session.refreshToken) throw new Error('Your session has expired. Please sign in again.');
  const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: session.refreshToken }),
    cache: 'no-store',
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(decodeError(payload, 'Your session could not be refreshed.'));
  return {
    ...session,
    idToken: String(payload.id_token || ''),
    refreshToken: String(payload.refresh_token || session.refreshToken),
    expiresAt: Date.now() + Math.max(60, Number(payload.expires_in || 3600)) * 1000,
    localId: String(payload.user_id || session.localId),
  };
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  if (typeof window !== 'undefined') return decodeURIComponent(Array.from(atob(padded)).map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''));
  return Buffer.from(padded, 'base64').toString('utf8');
}

export function parseFirebaseClaims(token: string): FirebaseClaims {
  try {
    const segment = token.split('.')[1];
    if (!segment) return {};
    return JSON.parse(base64UrlDecode(segment));
  } catch {
    return {};
  }
}
