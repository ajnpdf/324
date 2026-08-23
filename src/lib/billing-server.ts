import { NextRequest, NextResponse } from 'next/server';
import { configuredPdfBackendCandidates } from '@/lib/backend-service-url';
import { verifyFirebaseIdToken } from '@/lib/firebase-token';

export async function billingIdentity(request: NextRequest) {
  const authorization = request.headers.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  if (!token) throw new Error('AUTH_REQUIRED');
  try {
    return await verifyFirebaseIdToken(token);
  } catch {
    throw new Error('AUTH_INVALID');
  }
}

function internalToken() {
  return (process.env.AJN_BILLING_INTERNAL_TOKEN || '').trim();
}

function safeBackendError(status: number, body: string): string {
  try {
    const payload = JSON.parse(body || '{}') as { error?: unknown; detail?: unknown };
    const candidate = String(payload.error || payload.detail || '').replace(/[\r\n\t]+/g, ' ').trim();
    if (candidate && candidate.length <= 180 && !/(secret|key[_ -]?secret|authorization|bearer|token=)/i.test(candidate)) return candidate;
  } catch {
    // Fall back to a stable public message below.
  }
  if (status === 502) return 'The payment provider could not complete this billing request. Please try again.';
  if (status === 503) return 'AJN PDF billing is temporarily unavailable. Please try again shortly.';
  return 'AJN PDF billing could not complete this request. Please try again.';
}

export async function proxyBilling(
  request: NextRequest,
  path: string,
  init?: { method?: 'GET' | 'POST'; body?: unknown },
) {
  let identity;
  try {
    identity = await billingIdentity(request);
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    return NextResponse.json(
      { error: code === 'AUTH_REQUIRED' ? 'Sign in is required.' : 'Your Firebase session is invalid or expired.' },
      { status: 401 },
    );
  }

  const secret = internalToken();
  if (!secret) return NextResponse.json({ error: 'Billing proxy is not configured.' }, { status: 503 });

  const candidates = configuredPdfBackendCandidates(true);
  let lastBackendFailure: { status: number; body: string } | null = null;
  for (const base of candidates) {
    try {
      const response = await fetch(`${base}${path}`, {
        method: init?.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-AJN-Internal-Token': secret,
          'X-AJN-User-UID': identity.uid,
          'X-AJN-User-Email': identity.email,
        },
        body: init?.body === undefined ? undefined : JSON.stringify(init.body),
        cache: 'no-store',
      });
      const text = await response.text();
      if (response.status >= 500) {
        lastBackendFailure = { status: response.status, body: text };
        continue;
      }
      return new NextResponse(text || '{}', {
        status: response.status,
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
      });
    } catch {
      // Try the next configured production backend candidate.
    }
  }

  if (lastBackendFailure) {
    return NextResponse.json(
      { error: safeBackendError(lastBackendFailure.status, lastBackendFailure.body) },
      { status: lastBackendFailure.status === 502 ? 502 : 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  return NextResponse.json({ error: 'AJN PDF billing service could not be reached. Check your connection and try again.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
}
