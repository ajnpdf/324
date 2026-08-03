import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/server/require-user';
import { saveGooglePlayEntitlement } from '@/lib/server/google-play';

export const runtime = 'nodejs';

const bodySchema = z.object({
  purchaseToken: z.string().min(20),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const { purchaseToken } = bodySchema.parse(await request.json());
    const result = await saveGooglePlayEntitlement(user.uid, purchaseToken);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: message === 'UNAUTHENTICATED' ? 401 : 400 },
    );
  }
}
