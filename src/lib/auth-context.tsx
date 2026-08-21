"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  FirebaseSession,
  firebaseAuthConfigured,
  googleAuthConfigured,
  googleClientId,
  parseFirebaseClaims,
  refreshFirebaseSession,
  sendPasswordReset,
  signInFirebaseWithGoogleIdToken,
  signInWithEmail,
  signUpWithEmail,
} from './firebase-rest';

const STORAGE_KEY = 'ajn.firebase.session.v1';

type AuthContextValue = {
  configured: boolean;
  loading: boolean;
  session: FirebaseSession | null;
  claims: ReturnType<typeof parseFirebaseClaims>;
  plan: 'free' | 'premium' | 'business';
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string): Promise<void>;
  signInWithGoogle(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  signOut(): void;
  getIdToken(): Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function persist(value: FirebaseSession | null) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be unavailable in private/locked-down browser modes.
  }
}

function normalizePlan(value: unknown, premium: unknown): 'free' | 'premium' | 'business' {
  if (value === 'business') return 'business';
  if (value === 'premium' || premium === true) return 'premium';
  return 'free';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<FirebaseSession | null>(null);
  const [loading, setLoading] = useState(true);

  const setAndPersist = useCallback((value: FirebaseSession | null) => {
    setSession(value);
    persist(value);
  }, []);

  useEffect(() => {
    if (!firebaseAuthConfigured) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const stored = JSON.parse(raw) as FirebaseSession;
        const next = stored.expiresAt > Date.now() + 120_000 ? stored : await refreshFirebaseSession(stored);
        if (!cancelled) setAndPersist(next);
      } catch {
        if (!cancelled) setAndPersist(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [setAndPersist]);

  const getIdToken = useCallback(async () => {
    if (!session) return null;
    if (session.expiresAt > Date.now() + 120_000) return session.idToken;
    try {
      const next = await refreshFirebaseSession(session);
      setAndPersist(next);
      return next.idToken;
    } catch {
      setAndPersist(null);
      return null;
    }
  }, [session, setAndPersist]);

  const signIn = useCallback(async (email: string, password: string) => {
    setAndPersist(await signInWithEmail(email, password));
  }, [setAndPersist]);

  const signUp = useCallback(async (email: string, password: string) => {
    setAndPersist(await signUpWithEmail(email, password));
  }, [setAndPersist]);

  const signInWithGoogle = useCallback(async () => {
    if (!googleAuthConfigured || !googleClientId) throw new Error('Google sign-in is not configured for this deployment.');
    const google = (window as any).google;
    if (!google?.accounts?.id) throw new Error('Google sign-in is still loading. Try again in a moment.');
    const credential = await new Promise<string>((resolve, reject) => {
      let settled = false;
      google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response: { credential?: string }) => {
          if (response?.credential) { settled = true; resolve(response.credential); }
          else reject(new Error('Google did not return a sign-in credential.'));
        },
      });
      google.accounts.id.prompt((notification: any) => {
        if (!settled && (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.())) {
          reject(new Error('Google sign-in could not open. Check popup/cookie settings or use email sign-in.'));
        }
      });
    });
    setAndPersist(await signInFirebaseWithGoogleIdToken(credential));
  }, [setAndPersist]);

  const claims = useMemo(() => session ? parseFirebaseClaims(session.idToken) : {}, [session]);
  const plan = normalizePlan(claims.plan, claims.premium);

  const value = useMemo<AuthContextValue>(() => ({
    configured: firebaseAuthConfigured,
    loading,
    session,
    claims,
    plan,
    signIn,
    signUp,
    signInWithGoogle,
    resetPassword: sendPasswordReset,
    signOut: () => setAndPersist(null),
    getIdToken,
  }), [loading, session, claims, plan, signIn, signUp, signInWithGoogle, setAndPersist, getIdToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}
