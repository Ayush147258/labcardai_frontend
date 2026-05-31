// ─────────────────────────────────────────────────────────────────────────────
// LabCard AI — /api/payment/verify
// Verifies Razorpay payment signature using HMAC SHA256
// This is the ONLY trusted step — never skip this on the server
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ── Types ─────────────────────────────────────────────────────────────────────

type Plan = 'per_report' | 'monthly';

interface VerifyRequestBody {
  razorpay_order_id:   string;
  razorpay_payment_id: string;
  razorpay_signature:  string;
  plan:                Plan;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // ── 1. Validate secret key is configured ──────────────────────────────
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error('[verify] RAZORPAY_KEY_SECRET not set');
      return NextResponse.json(
        { success: false, error: 'Payment verification not configured.' },
        { status: 503 }
      );
    }

    // ── 2. Parse body ─────────────────────────────────────────────────────
    let body: Partial<VerifyRequestBody>;
    try {
      body = (await req.json()) as Partial<VerifyRequestBody>;
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body.' },
        { status: 400 }
      );
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
    } = body;

    // ── 3. Validate all required fields are present ───────────────────────
    if (!razorpay_order_id || typeof razorpay_order_id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'razorpay_order_id is required.' },
        { status: 400 }
      );
    }
    if (!razorpay_payment_id || typeof razorpay_payment_id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'razorpay_payment_id is required.' },
        { status: 400 }
      );
    }
    if (!razorpay_signature || typeof razorpay_signature !== 'string') {
      return NextResponse.json(
        { success: false, error: 'razorpay_signature is required.' },
        { status: 400 }
      );
    }
    if (!plan || (plan !== 'per_report' && plan !== 'monthly')) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan value.' },
        { status: 400 }
      );
    }

    // ── 4. HMAC SHA256 signature verification ─────────────────────────────
    // Razorpay signs: order_id + "|" + payment_id using key_secret
    // Reference: https://razorpay.com/docs/payments/server-integration/verify-payment/
    const signaturePayload = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(signaturePayload)
      .digest('hex');

    // ── 5. Constant-time comparison (prevents timing attacks) ─────────────
    // crypto.timingSafeEqual requires same-length Buffers
    const expectedBuf = Buffer.from(expectedSignature, 'hex');
    const receivedBuf = Buffer.from(razorpay_signature,  'hex');

    let signatureValid = false;
    if (expectedBuf.length === receivedBuf.length) {
      signatureValid = crypto.timingSafeEqual(expectedBuf, receivedBuf);
    }

    if (!signatureValid) {
      console.warn(
        `[verify] Signature mismatch for order ${razorpay_order_id}`,
        `| payment ${razorpay_payment_id}`
      );
      return NextResponse.json(
        { success: false, error: 'Payment verification failed. Invalid signature.' },
        { status: 400 }
      );
    }

    // ── 6. Signature verified — payment is authentic ──────────────────────
    console.log(
      `[verify] ✓ Payment verified | order=${razorpay_order_id}`,
      `| payment=${razorpay_payment_id} | plan=${plan}`
    );

    return NextResponse.json({
      success:   true,
      plan,
      paymentId: razorpay_payment_id,
      orderId:   razorpay_order_id,
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[verify] Unexpected error:', msg);
    return NextResponse.json(
      { success: false, error: 'Verification failed. Please contact support.' },
      { status: 500 }
    );
  }
}
