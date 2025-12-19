import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Stripe webhook logic will be added here
  return NextResponse.json({ received: true });
}
