import { NextResponse } from "next/server";

/**
 * AJN WhatsApp API - Decommissioned
 */
export async function GET() {
  return new NextResponse("Service decommissioned", { status: 410 });
}

export async function POST() {
  return new NextResponse("Service decommissioned", { status: 410 });
}
