import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

/**
 * AJN Payment Node - Order Creation
 * Fulfills Razorpay Standard Checkout Step 1.
 * Hardened: Moved initialization inside handler to prevent build-time crashes.
 */
export async function POST(req: Request) {
  try {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      console.error("[AJN Razorpay]: Environment variables RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET are missing.");
      return NextResponse.json({ error: 'Gateway configuration mismatch.' }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const { amount } = await req.json();

    if (!amount || amount < 1) {
      return NextResponse.json({ error: 'Minimum amount 100 paise required.' }, { status: 400 });
    }

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error('[Razorpay Order Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal logic interrupt.' }, { status: 500 });
  }
}
