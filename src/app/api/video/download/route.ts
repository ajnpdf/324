import { NextResponse } from "next/server";

/**
 * DECOMMISSIONED ROUTE: Download Proxy
 */
export async function GET() {
  return new NextResponse("Service decommissioned", { status: 410 });
}
