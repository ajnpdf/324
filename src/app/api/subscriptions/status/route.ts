import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/require-user';
import { adminDb } from '@/lib/server/firebase-admin';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const document = await adminDb.collection('entitlements').doc(user.uid).get();

    return NextResponse.json({
      entitlement: document.exists
        ? document.data()
        : { active: false, tier: 'free', provider: null },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: message === 'UNAUTHENTICATED' ? 401 : 500 },
    );
  }
}
