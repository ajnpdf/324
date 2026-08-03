import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * AJN Payment Node - Signature Verification
 * Fulfills Razorpay Standard Checkout Step 3.
 */
export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing verification fields.' }, { status: 400 });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      return NextResponse.json({ success: true, message: 'Payment verified.' });
    } else {
      return NextResponse.json({ success: false, message: 'Signature mismatch.' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[Razorpay Verification Error]:', error);
    return NextResponse.json({ error: 'Internal system interrupt.' }, { status: 500 });
  }
}
