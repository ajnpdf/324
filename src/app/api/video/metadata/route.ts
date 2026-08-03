import { NextResponse } from "next/server";

/**
 * DECOMMISSIONED ROUTE: Metadata Hub
 */
export async function POST() {
  return new NextResponse("Service decommissioned", { status: 410 });
}
