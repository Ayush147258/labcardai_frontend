// ─────────────────────────────────────────────────────────────────────────────
// LabCard AI — /api/payment/create-order
// Creates a Razorpay order for per_report (₹49) or monthly (₹199) plans
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ── Types ─────────────────────────────────────────────────────────────────────

type Plan = 'per_report' | 'monthly';

interface CreateOrderBody {
  plan: Plan;
}

// Razorpay SDK types are loose — define what we need from the response
interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

// ── Pricing map (amounts in paise — INR × 100) ────────────────────────────────

const PLAN_PRICING: Record<Plan, { amountPaise: number; label: string }> = {
  per_report: { amountPaise: 4900,  label: '₹49 — Single Report' },
  monthly:    { amountPaise: 19900, label: '₹199 — Monthly Unlimited' },
};

// ── Razorpay client (top-level init as required) ──────────────────────────────
// Initialized at module level — Razorpay SDK is designed for this pattern
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // ── 1. Validate env vars are present ──────────────────────────────────
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('[create-order] Razorpay keys not configured');
      return NextResponse.json(
        { error: 'Payment service not configured. Please contact support.' },
        { status: 503 }
      );
    }

    // ── 2. Parse body ─────────────────────────────────────────────────────
    let body: Partial<CreateOrderBody>;
    try {
      body = (await req.json()) as Partial<CreateOrderBody>;
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body.' },
        { status: 400 }
      );
    }

    const { plan } = body;

    // ── 3. Validate plan ──────────────────────────────────────────────────
    if (!plan || !Object.keys(PLAN_PRICING).includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be "per_report" or "monthly".' },
        { status: 400 }
      );
    }

    const { amountPaise, label } = PLAN_PRICING[plan];

    // ── 4. Create Razorpay order ──────────────────────────────────────────
    console.log(`[create-order] Creating order: plan=${plan} amount=${amountPaise} paise`);

    const order = (await razorpay.orders.create({
      amount:   amountPaise,
      currency: 'INR',
      receipt:  `labcard_${Date.now()}`,
      notes: {
        plan,
        product: 'LabCard AI',
        description: label,
      },
    })) as RazorpayOrder;

    console.log(`[create-order] Order created: ${order.id}`);

    // ── 5. Return order details to client ─────────────────────────────────
    // NEXT_PUBLIC_RAZORPAY_KEY_ID is safe to expose (it's the public key)
    return NextResponse.json({
      orderId:  order.id,
      amount:   amountPaise,
      currency: 'INR',
      plan,
      label,
      keyId:    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '',
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[create-order] Razorpay error:', msg);

    // Razorpay errors often contain useful info — surface safely
    const isRazorpayError = msg.includes('Bad Request') || msg.includes('401');
    return NextResponse.json(
      {
        error: isRazorpayError
          ? 'Payment service error. Please check your Razorpay configuration.'
          : 'Could not create payment order. Please try again.',
      },
      { status: 500 }
    );
  }
}
