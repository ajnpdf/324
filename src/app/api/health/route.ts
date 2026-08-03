
import { NextResponse } from 'next/server';

/**
 * Next.js Health API
 * Satisfies deployment heartbeats to ensure high uptime.
 */
export async function GET() {
  return NextResponse.json(
    { status: 'ok', timestamp: new Date().toISOString() },
    { status: 200 }
  );
}
