
import { NextResponse } from 'next/server';

/**
 * Root Heartbeat Endpoint
 * Prevents 404 errors during infrastructure monitoring.
 */
export async function GET() {
  return NextResponse.json(
    { status: 'ok', timestamp: new Date().toISOString() },
    { status: 200 }
  );
}
