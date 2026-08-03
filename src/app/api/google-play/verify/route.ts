import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/server/require-user';
import { persistPlayEntitlement } from '@/lib/server/google-play';

export const runtime = 'nodejs';

const schema = z.object({
  purchaseToken: z.string().min(20),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const { purchaseToken } = schema.parse(await request.json());
    const verified = await persistPlayEntitlement(user.uid, purchaseToken);
    return NextResponse.json({
      active: verified.active,
      state: verified.state,
      productIds: verified.productIds,
      expiryTime: verified.expiryTime,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: message === 'UNAUTHENTICATED' ? 401 : 400 });
  }
}