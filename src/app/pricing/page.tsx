'use client';

// ─────────────────────────────────────────────────────────────────────────────
// LabCard AI — Pricing Page
// Light theme: #FFFFFF bg, #0A1628 text, #00D4AA teal accent
// Razorpay integration with dynamic script loading
// ─────────────────────────────────────────────────────────────────────────────

import { useState }    from 'react';
import { useRouter }   from 'next/navigation';
import Link            from 'next/link';

// ── Color constants — light theme ─────────────────────────────────────────────
const TEAL        = '#00D4AA';
const TEAL_DARK   = '#00B896';
const TEAL_DIM    = 'rgba(0,212,170,0.08)';
const TEAL_BORDER = 'rgba(0,212,170,0.20)';
const NAVY        = '#0A1628';
const MUTED       = '#64748B';
const BG          = '#FFFFFF';
const BG_TINT     = '#F8FFFE';
const BG_SECTION  = '#F0FEFA';
const BORDER      = '#E8F5F2';
const BORDER_GRAY = '#F1F5F9';

type Plan = 'per_report' | 'monthly';

// Razorpay payment response shape
interface RazorpayResponse {
  razorpay_order_id:   string;
  razorpay_payment_id: string;
  razorpay_signature:  string;
}

interface RazorpayOptions {
  key:         string;
  amount:      number;
  currency:    string;
  name:        string;
  description: string;
  order_id:    string;
  prefill:     Record<string, string>;
  theme:       { color: string };
  handler:     (response: RazorpayResponse) => Promise<void>;
  modal:       { ondismiss: () => void };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

// ── Feature row component ─────────────────────────────────────────────────────
function FeatureRow({ text, included }: { text: string; included: boolean }) {
  return (
    <div style={{
      display:    'flex',
      alignItems: 'flex-start',
      gap:        8,
      fontSize:   13,
      lineHeight: 1.5,
    }}>
      <span style={{
        flexShrink: 0,
        marginTop:  1,
        fontSize:   13,
        color:      included ? '#16a34a' : '#CBD5E1',
        fontWeight: 600,
      }}>
        {included ? '✓' : '✗'}
      </span>
      <span style={{
        color:          included ? '#475569' : '#CBD5E1',
        textDecoration: included ? 'none' : 'line-through',
      }}>
        {text}
      </span>
    </div>
  );
}

// ── FAQ accordion item ────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderBottom: `1px solid ${BORDER_GRAY}`,
    }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width:       '100%',
          background:  'none',
          border:      'none',
          padding:     '16px 0',
          display:     'flex',
          alignItems:  'center',
          justifyContent: 'space-between',
          gap:         12,
          cursor:      'pointer',
          textAlign:   'left',
          fontFamily:  "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>
          {q}
        </span>
        <span style={{
          fontSize:   16,
          color:      MUTED,
          flexShrink: 0,
          transition: 'transform 0.2s',
          display:    'inline-block',
          transform:  open ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          ▾
        </span>
      </button>
      {open && (
        <p style={{
          fontSize:     13,
          color:        MUTED,
          lineHeight:   1.7,
          margin:       '0 0 16px',
          paddingRight: 24,
        }}>
          {a}
        </p>
      )}
    </div>
  );
}

export default function PricingPage(): React.ReactElement {
  const router                      = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);

  // ── Load Razorpay script dynamically ────────────────────────────────────────
  function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script    = document.createElement('script');
      script.src      = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async    = true;
      script.onload   = () => resolve(true);
      script.onerror  = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  // ── Payment handler ──────────────────────────────────────────────────────────
  async function handlePayment(plan: Plan) {
    // UTM-style analytics tracking
    sessionStorage.setItem('last_plan_clicked', plan);
    sessionStorage.setItem('last_plan_click_ts', String(Date.now()));
    setLoadingPlan(plan);

    try {
      // 1. Create Razorpay order
      const orderRes = await fetch('/api/payment/create-order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan }),
      });

      const orderData = await orderRes.json() as {
        orderId?: string; amount?: number; currency?: string;
        keyId?: string; error?: string;
      };

      if (!orderRes.ok || !orderData.orderId) {
        throw new Error(orderData.error ?? 'Could not create payment order.');
      }

      const { orderId, amount, currency, keyId } = orderData;

      // 2. Load Razorpay JS
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Razorpay failed to load. Check your connection.');

      // 3. Open checkout
      const options: RazorpayOptions = {
        key:         keyId ?? '',
        amount:      amount ?? 0,
        currency:    currency ?? 'INR',
        name:        'LabCard AI',
        description: plan === 'per_report'
          ? 'Single Report Analysis'
          : 'Monthly Unlimited Plan',
        order_id:    orderId ?? '',
        prefill:     {},
        theme:       { color: TEAL },
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              body:    JSON.stringify({ ...response, plan }),
            });
            const data = await verifyRes.json() as {
              success: boolean; paymentId?: string; error?: string;
            };

            if (data.success) {
              sessionStorage.setItem('user_tier',   'premium');
              sessionStorage.setItem('payment_id',  data.paymentId ?? '');
              router.push('/upload?upgraded=true');
            } else {
              alert('Payment verification failed. Please contact support@labcard.ai');
            }
          } catch {
            alert('Verification error. Please contact support@labcard.ai');
          }
        },
        modal: { ondismiss: () => setLoadingPlan(null) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      alert(msg);
      setLoadingPlan(null);
    }
  }

  // ── Shared button styles ────────────────────────────────────────────────────
  function payBtn(plan: Plan, bg: string, shadow: string): React.CSSProperties {
    const isLoading = loadingPlan === plan;
    return {
      width:        '100%',
      padding:      '12px',
      borderRadius: 10,
      border:       'none',
      background:   isLoading ? '#CBD5E1' : bg,
      color:        '#FFFFFF',
      fontSize:     14,
      fontWeight:   700,
      cursor:       isLoading ? 'not-allowed' : 'pointer',
      boxShadow:    isLoading ? 'none' : shadow,
      transition:   'opacity 0.15s, transform 0.1s',
      display:      'flex',
      alignItems:   'center',
      justifyContent: 'center',
      gap:          6,
      fontFamily:   "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
    };
  }

  return (
    <>
      <style>{`
        .pay-btn:hover:not(:disabled) { opacity: 0.88 !important; }
        .pay-btn:active:not(:disabled) { transform: scale(0.97) !important; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .plan-card { transition: box-shadow 0.2s, transform 0.15s; }
        .plan-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important; transform: translateY(-2px); }
        @media(max-width:640px){
          .plans-grid { grid-template-columns: 1fr !important; }
          .comparison-table { font-size: 12px !important; }
        }
      `}</style>

      <div style={{
        background: BG_TINT, minHeight: '100vh',
        fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
        color:      NAVY,
      }}>

        {/* ── Navbar ──────────────────────────────────────────────────────── */}
        <nav style={{
          position:        'sticky', top: 0, zIndex: 40,
          background:      'rgba(255,255,255,0.92)',
          backdropFilter:  'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom:    `1px solid ${BORDER}`,
          padding:         '0 24px', height: 56,
          display:         'flex', alignItems: 'center',
          justifyContent:  'space-between',
        }}>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none',
          }}>
            <span style={{ fontSize: 16 }}>🩺</span>
            <span style={{ fontWeight: 700, fontSize: 15, color: NAVY }}>
              LabCard<span style={{ color: TEAL }}>AI</span>
            </span>
          </Link>
          <Link href="/upload" style={{
            padding: '7px 16px', borderRadius: 8, border: 'none',
            background: TEAL, color: '#FFFFFF',
            fontSize: 13, fontWeight: 600, textDecoration: 'none',
            boxShadow: '0 2px 6px rgba(0,212,170,0.28)',
          }}>
            Upload Report
          </Link>
        </nav>

        <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 20px 80px' }}>

          {/* ── Header ──────────────────────────────────────────────────── */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{
              display:      'inline-flex', alignItems: 'center', gap: 6,
              background:   TEAL_DIM, border: `1px solid ${TEAL_BORDER}`,
              borderRadius: 20, padding: '4px 14px',
              fontSize: 12, fontWeight: 600, color: TEAL_DARK,
              marginBottom: 16,
            }}>
              💡 Transparent pricing
            </span>
            <h1 style={{
              fontSize: 'clamp(26px,5vw,40px)', fontWeight: 700,
              color: NAVY, letterSpacing: '-0.03em',
              margin: '0 0 12px',
            }}>
              Simple, honest pricing
            </h1>
            <p style={{ fontSize: 16, color: MUTED, margin: 0 }}>
              No subscriptions required. Pay per report or go monthly.
            </p>
          </div>

          {/* ── Plan cards ──────────────────────────────────────────────── */}
          <div className="plans-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap:    16,
            marginBottom: 48,
            alignItems: 'start',
          }}>

            {/* FREE CARD */}
            <div className="plan-card" style={{
              background:   BG,
              border:       `1px solid ${BORDER_GRAY}`,
              borderRadius: 16,
              padding:      '24px 20px',
              boxShadow:    '0 1px 3px rgba(0,0,0,0.04)',
              display:      'flex', flexDirection: 'column', gap: 16,
            }}>
              <div>
                <span style={{
                  background: BORDER_GRAY, color: MUTED,
                  borderRadius: 20, padding: '3px 10px',
                  fontSize: 11, fontWeight: 700,
                }}>Free</span>
              </div>
              <div>
                <div style={{
                  fontSize: 38, fontWeight: 800, color: NAVY,
                  letterSpacing: '-0.04em', lineHeight: 1,
                }}>
                  ₹0
                </div>
                <div style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>
                  Per report
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {[
                  { text: 'Upload any Indian lab PDF',    in: true  },
                  { text: 'Color-coded health card',      in: true  },
                  { text: 'AI analysis (Gemini / Groq)',  in: true  },
                  { text: 'Biological age estimate',      in: true  },
                  { text: 'Hindi + English chat',         in: true  },
                  { text: 'WhatsApp-ready summary',       in: true  },
                  { text: 'Claude-powered precision',     in: false },
                  { text: 'Priority processing',          in: false },
                ].map((f) => <FeatureRow key={f.text} text={f.text} included={f.in} />)}
              </div>
              <button
                className="pay-btn"
                onClick={() => {
                sessionStorage.setItem('last_plan_clicked', 'free');
                sessionStorage.setItem('last_plan_click_ts', String(Date.now()));
                router.push('/upload');
              }}
                style={{
                  ...payBtn('per_report', '#475569', 'none'),
                  background: BG,
                  color:      NAVY,
                  border:     `1.5px solid ${BORDER_GRAY}`,
                  boxShadow:  '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                Start Free →
              </button>
            </div>

            {/* PER REPORT CARD — POPULAR */}
            <div className="plan-card" style={{
              background:   BG,
              border:       `2px solid ${TEAL}`,
              borderRadius: 16,
              padding:      '24px 20px',
              boxShadow:    `0 4px 16px rgba(0,212,170,0.18)`,
              display:      'flex', flexDirection: 'column', gap: 16,
              position:     'relative',
            }}>
              {/* Most popular banner */}
              <div style={{
                position:     'absolute', top: -1, left: '50%',
                transform:    'translateX(-50%)',
                background:   TEAL, color: '#FFFFFF',
                borderRadius: '0 0 10px 10px',
                padding:      '4px 14px',
                fontSize:     11, fontWeight: 700,
                whiteSpace:   'nowrap',
              }}>
                ⭐ Most Popular
              </div>
              <div style={{ marginTop: 12 }}>
                <span style={{
                  background: TEAL_DIM, color: TEAL_DARK,
                  border: `1px solid ${TEAL_BORDER}`,
                  borderRadius: 20, padding: '3px 10px',
                  fontSize: 11, fontWeight: 700,
                }}>Popular</span>
              </div>
              <div>
                <div style={{
                  fontSize: 38, fontWeight: 800, color: NAVY,
                  letterSpacing: '-0.04em', lineHeight: 1,
                }}>
                  ₹49
                </div>
                <div style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>
                  Per report · One-time
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {[
                  'Everything in Free',
                  'Claude Sonnet AI (most accurate)',
                  'Priority processing',
                  'Detailed bio-age analysis',
                  'Advanced doctor notes',
                ].map((f) => <FeatureRow key={f} text={f} included={true} />)}
              </div>
              <button
                className="pay-btn"
                onClick={() => void handlePayment('per_report')}
                disabled={loadingPlan !== null}
                style={payBtn('per_report', TEAL, '0 4px 14px rgba(0,212,170,0.35)')}
              >
                {loadingPlan === 'per_report' ? (
                  <>
                    <span style={{
                      width: 13, height: 13,
                      border: '2px solid rgba(255,255,255,0.35)',
                      borderTopColor: '#FFFFFF', borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    Opening…
                  </>
                ) : 'Pay ₹49 →'}
              </button>
            </div>

            {/* MONTHLY CARD */}
            <div className="plan-card" style={{
              background:   BG,
              border:       `1px solid ${BORDER_GRAY}`,
              borderRadius: 16,
              padding:      '24px 20px',
              boxShadow:    '0 1px 3px rgba(0,0,0,0.04)',
              display:      'flex', flexDirection: 'column', gap: 16,
            }}>
              <div>
                <span style={{
                  background: 'rgba(245,158,11,0.10)',
                  color:      '#92400E',
                  border:     '1px solid rgba(245,158,11,0.25)',
                  borderRadius: 20, padding: '3px 10px',
                  fontSize: 11, fontWeight: 700,
                }}>Best Value</span>
              </div>
              <div>
                <div style={{
                  fontSize: 38, fontWeight: 800, color: NAVY,
                  letterSpacing: '-0.04em', lineHeight: 1,
                }}>
                  ₹199
                </div>
                <div style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>
                  Per month · Unlimited
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {[
                  'Everything in Per Report',
                  'Unlimited reports',
                  'Save ₹1 per report vs per-report',
                ].map((f) => <FeatureRow key={f} text={f} included={true} />)}
              </div>
              <button
                className="pay-btn"
                onClick={() => void handlePayment('monthly')}
                disabled={loadingPlan !== null}
                style={payBtn('monthly', '#7C3AED', '0 4px 14px rgba(124,58,237,0.28)')}
              >
                {loadingPlan === 'monthly' ? (
                  <>
                    <span style={{
                      width: 13, height: 13,
                      border: '2px solid rgba(255,255,255,0.35)',
                      borderTopColor: '#FFFFFF', borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    Opening…
                  </>
                ) : 'Pay ₹199/mo →'}
              </button>
            </div>
          </div>

          {/* ── Comparison table ────────────────────────────────────────── */}
          <div style={{
            background: BG, border: `1px solid ${BORDER_GRAY}`,
            borderRadius: 14, overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            marginBottom: 40,
          }}>
            <div style={{
              padding: '16px 20px', borderBottom: `1px solid ${BORDER_GRAY}`,
              background: BG_SECTION,
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: NAVY, margin: 0 }}>
                Quick comparison
              </p>
            </div>
            <table className="comparison-table" style={{
              width: '100%', borderCollapse: 'collapse', fontSize: 13,
            }}>
              <thead>
                <tr style={{ background: BG_TINT }}>
                  {['Feature', 'Free', 'Per Report ₹49', 'Monthly ₹199'].map((h) => (
                    <th key={h} style={{
                      padding: '10px 16px', textAlign: 'left',
                      fontSize: 11, fontWeight: 700, color: MUTED,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      borderBottom: `1px solid ${BORDER_GRAY}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['AI Model',       'Gemini / Groq', 'Claude Sonnet',  'Claude Sonnet'],
                  ['Reports',        'Unlimited',     '1 per payment',  'Unlimited'],
                  ['Speed',          'Standard',      'Priority',       'Priority'],
                  ['Accuracy',       'Good',          'Best',           'Best'],
                  ['Hindi chat',     '✓',             '✓',              '✓'],
                  ['Bio-Age',        '✓',             '✓ (detailed)',   '✓ (detailed)'],
                  ['Doctor notes',   'Basic',         'Advanced',       'Advanced'],
                ].map(([feat, free, per, monthly], i) => (
                  <tr key={feat} style={{
                    background: i % 2 === 0 ? BG : BG_TINT,
                    borderBottom: `1px solid ${BORDER_GRAY}`,
                  }}>
                    <td style={{ padding: '10px 16px', fontWeight: 500, color: NAVY }}>{feat}</td>
                    <td style={{ padding: '10px 16px', color: MUTED }}>{free}</td>
                    <td style={{ padding: '10px 16px', color: TEAL_DARK, fontWeight: 600 }}>{per}</td>
                    <td style={{ padding: '10px 16px', color: '#7C3AED', fontWeight: 600 }}>{monthly}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Trust section ───────────────────────────────────────────── */}
          <div style={{
            textAlign: 'center', marginBottom: 40,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          }}>
            <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>
              Powered by <strong style={{ color: NAVY }}>Razorpay</strong> ·
              UPI · Cards · Net Banking · Wallets
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['🔒 100% Secure', '✓ PCI DSS Compliant', '🇮🇳 Indian Payment Gateway'].map((b) => (
                <span key={b} style={{
                  background: BORDER_GRAY, color: MUTED,
                  borderRadius: 20, padding: '4px 12px',
                  fontSize: 12, fontWeight: 500,
                }}>{b}</span>
              ))}
            </div>
          </div>

          {/* ── FAQ ─────────────────────────────────────────────────────── */}
          <div style={{
            background:   BG,
            border:       `1px solid ${BORDER_GRAY}`,
            borderRadius: 14,
            padding:      '20px 24px',
            boxShadow:    '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <p style={{
              fontSize: 16, fontWeight: 700, color: NAVY,
              margin: '0 0 4px', letterSpacing: '-0.01em',
            }}>
              Frequently asked questions
            </p>
            <p style={{ fontSize: 13, color: MUTED, margin: '0 0 16px' }}>
              Everything you need to know about LabCard AI pricing.
            </p>
            <FAQItem
              q="Is my data safe?"
              a="Your PDF is processed in-memory and never stored on our servers. We only keep the analysis results temporarily in your browser session."
            />
            <FAQItem
              q="What is the difference between free and premium?"
              a="Free tier uses Gemini 2.5 Flash or Groq Llama AI models, which are fast and capable. Premium uses Claude Sonnet by Anthropic, which has significantly better medical reasoning, fewer extraction errors, and more detailed explanations."
            />
            <FAQItem
              q="Can I get a refund?"
              a="If the analysis fails or returns clearly incorrect results, email us at support@labcard.ai for a full refund. We stand behind our product."
            />
            <FAQItem
              q="Which Indian labs are supported?"
              a="Any lab that produces a PDF report — Thyrocare, Dr. Lal PathLabs, Apollo Diagnostics, SRL, Metropolis, Agilus, and more. You can also paste raw text from any report."
            />
          </div>

          {/* ── Bottom CTA ──────────────────────────────────────────────── */}
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <p style={{ fontSize: 14, color: MUTED, marginBottom: 16 }}>
              Still unsure? Try the free tier first — no card required.
            </p>
            <button
              onClick={() => router.push('/upload')}
              style={{
                padding:      '12px 28px',
                borderRadius: 10,
                border:       `1.5px solid ${TEAL_BORDER}`,
                background:   TEAL_DIM,
                color:        TEAL_DARK,
                fontSize:     14, fontWeight: 700,
                cursor:       'pointer',
                fontFamily:   "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
                transition:   'all 0.15s',
              }}
            >
              Try Free →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
