// ─────────────────────────────────────────────────────────────────────────────
// LabCard AI — Landing Page
// Matches: https://labcardai.vercel.app/
// Light theme: white/cream bg, #00D4AA teal accent, #0A1628 dark text
// Server Component — no 'use client' needed
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LabCard AI — Visual. Vernacular. Verifiable.',
  description:
    'Upload any Indian blood test PDF and get a beautiful, color-coded health card with biological age and AI chat in Hindi & English in 10 seconds.',
  keywords: 'lab report, blood test, AI health, India, Hindi, health card',
  openGraph: {
    title: 'LabCard AI',
    description: 'Your lab report, finally understood.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'LabCard AI',
    description: 'Your lab report, finally understood.',
  },
};

// ── Inline style constants ────────────────────────────────────────────────────
const TEAL        = '#00D4AA';
const TEAL_DARK   = '#00B896';
const TEAL_DIM    = 'rgba(0,212,170,0.10)';
const TEAL_BORDER = 'rgba(0,212,170,0.22)';
const NAVY        = '#0A1628';
const MUTED       = '#64748B';
const BG          = '#FFFFFF';
const BG_TINT     = '#F8FFFE';
const BG_SECTION  = '#F0FEFA';
const BORDER      = '#E8F5F2';
const BORDER_GRAY = '#F1F5F9';

export default function HomePage(): React.ReactElement {
  return (
    <div style={{ background: BG, color: NAVY, fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif", minHeight: '100vh' }}>

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${BORDER}`,
        padding: '0 24px',
        height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: TEAL,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>🩺</div>
          <span style={{ fontWeight: 700, fontSize: 16, color: NAVY, letterSpacing: '-0.01em' }}>
            LabCard<span style={{ color: TEAL }}>AI</span>
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/upload?demo=true" style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500,
            color: MUTED, textDecoration: 'none', transition: 'color 0.15s',
          }}>
            Try Demo
          </Link>
          <Link href="/upload" style={{
            padding: '8px 18px', borderRadius: 10, fontSize: 14, fontWeight: 600,
            background: TEAL, color: '#FFFFFF', textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(0,212,170,0.30)',
            transition: 'opacity 0.15s, box-shadow 0.15s',
          }}>
            Upload Report
          </Link>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: 'calc(100vh - 60px)',
        background: 'linear-gradient(160deg, #F0FEFA 0%, #FFFFFF 45%, #FFF8F5 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center',
        padding: '80px 24px 60px',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: TEAL_DIM, border: `1px solid ${TEAL_BORDER}`,
          borderRadius: 24, padding: '6px 14px',
          fontSize: 13, fontWeight: 500, color: TEAL_DARK,
          marginBottom: 28,
        }}>
          <span>✨</span> AI-Powered • Instant • Private
        </div>

        {/* H1 */}
        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 64px)',
          fontWeight: 700, lineHeight: 1.12,
          letterSpacing: '-0.03em',
          color: NAVY,
          maxWidth: 720, margin: '0 auto 20px',
        }}>
          Your Lab Report,{' '}
          <span style={{
            color: TEAL,
            textDecoration: 'underline',
            textDecorationColor: TEAL,
            textUnderlineOffset: 6,
          }}>
            Finally Understood.
          </span>
        </h1>

        {/* Subtext */}
        <p style={{
          fontSize: 'clamp(16px, 2vw, 19px)',
          color: MUTED, lineHeight: 1.65,
          maxWidth: 560, margin: '0 auto 36px',
        }}>
          Upload any Indian blood test PDF and get a beautiful, colour-coded health card with your{' '}
          <strong style={{ color: NAVY }}>biological age</strong> and{' '}
          <strong style={{ color: NAVY }}>AI chat in Hindi &amp; English</strong>
          {' '}— in 10 seconds.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
          <Link href="/upload" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: TEAL, color: '#FFFFFF',
            padding: '13px 28px', borderRadius: 12,
            fontSize: 15, fontWeight: 700, textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(0,212,170,0.35)',
            letterSpacing: '-0.01em',
          }}>
            Upload Report <span style={{ fontSize: 14 }}>→</span>
          </Link>
          <Link href="/upload?demo=true" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'transparent', color: TEAL_DARK,
            padding: '13px 28px', borderRadius: 12,
            fontSize: 15, fontWeight: 700, textDecoration: 'none',
            border: `2px solid ${TEAL}`,
          }}>
            Try Demo ▶
          </Link>
        </div>

        {/* Trust text */}
        <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>
          No account required · Works with Thyrocare, Dr. Lal, Apollo &amp; more
        </p>

        {/* ── STATS ROW ──────────────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(140px, 1fr))',
          gap: 16, marginTop: 64, width: '100%', maxWidth: 720,
        }}>
          {[
            { num: '600M+',   sub: 'Lab tests / year in India' },
            { num: '10 sec',  sub: 'To analyse any report' },
            { num: 'Bio Age', sub: "India's only estimator" },
            { num: 'हिं + EN', sub: 'Hindi & English AI chat' },
          ].map(({ num, sub }) => (
            <div key={num} style={{
              background: '#FFFFFF',
              border: `1px solid ${BORDER}`,
              borderRadius: 14,
              padding: '20px 12px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: 'clamp(20px, 3vw, 26px)',
                fontWeight: 700, color: TEAL,
                letterSpacing: '-0.02em', marginBottom: 6,
              }}>{num}</div>
              <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.4 }}>{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────────── */}
      <section style={{
        background: BG_TINT,
        padding: '80px 24px',
        borderTop: `1px solid ${BORDER}`,
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          {/* Section label */}
          <p style={{
            textAlign: 'center',
            fontSize: 12, fontWeight: 600,
            color: TEAL_DARK, textTransform: 'uppercase',
            letterSpacing: '0.1em', marginBottom: 12,
          }}>What you get</p>

          <h2 style={{
            textAlign: 'center',
            fontSize: 'clamp(26px, 4vw, 40px)',
            fontWeight: 700, color: NAVY,
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}>More than a report viewer</h2>

          <p style={{
            textAlign: 'center', color: MUTED, fontSize: 16,
            maxWidth: 520, margin: '0 auto 52px',
          }}>
            Every feature is built for real Indian patients — not just elite lab users.
          </p>

          {/* Feature grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
          }}>
            {[
              {
                icon: '📊',
                title: 'Visual Health Score',
                desc: 'A 0–100 gauge that instantly tells you where you stand — no medical background needed.',
              },
              {
                icon: '🧬',
                title: 'Biological Age Estimation',
                desc: "India's first — see how your biomarkers compare to your actual age. Function Health charges $499/yr for this in the USA.",
              },
              {
                icon: '💬',
                title: 'AI Chat in Hindi & English',
                desc: 'Ask "मेरा Vitamin D कम क्यों है?" and get a warm, plain-language answer based on your actual report.',
              },
              {
                icon: '🍽️',
                title: 'Indian Food Recommendations',
                desc: 'Not "eat spinach" — but "Palak (पालक), Anaar (अनार), Gud (गुड़)" — food your family actually cooks.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{
                background: BG,
                border: `1px solid ${BORDER_GRAY}`,
                borderRadius: 16,
                padding: '28px 24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.2s, border-color 0.2s',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: TEAL_DIM, border: `1px solid ${TEAL_BORDER}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, marginBottom: 16,
                }}>{icon}</div>
                <h3 style={{
                  fontSize: 16, fontWeight: 600, color: NAVY,
                  marginBottom: 8, letterSpacing: '-0.01em',
                }}>{title}</h3>
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <section style={{
        background: BG,
        padding: '80px 24px',
        borderTop: `1px solid ${BORDER}`,
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <p style={{
            textAlign: 'center', fontSize: 12, fontWeight: 600,
            color: TEAL_DARK, textTransform: 'uppercase',
            letterSpacing: '0.1em', marginBottom: 12,
          }}>Simple as 1-2-3</p>

          <h2 style={{
            textAlign: 'center',
            fontSize: 'clamp(26px, 4vw, 40px)',
            fontWeight: 700, color: NAVY,
            letterSpacing: '-0.02em', marginBottom: 52,
          }}>How LabCard AI works</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 24,
          }}>
            {[
              {
                num: '01',
                title: 'Upload your PDF',
                desc: 'Thyrocare, Dr. Lal, Apollo — any lab works. Or paste text.',
              },
              {
                num: '02',
                title: 'AI reads every value',
                desc: 'Biomarkers detected, biological age calculated, foods matched.',
              },
              {
                num: '03',
                title: 'Get your Health Card',
                desc: 'Colour-coded cards, score gauge, chat, and WhatsApp share.',
              },
            ].map(({ num, title, desc }) => (
              <div key={num} style={{
                textAlign: 'center',
                padding: '32px 20px',
                background: BG_SECTION,
                border: `1px solid ${BORDER}`,
                borderRadius: 16,
              }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 48, height: 48, borderRadius: '50%',
                  background: TEAL, color: '#FFFFFF',
                  fontWeight: 800, fontSize: 15,
                  marginBottom: 16, boxShadow: '0 4px 12px rgba(0,212,170,0.30)',
                }}>{num}</div>
                <h3 style={{
                  fontSize: 17, fontWeight: 600, color: NAVY,
                  marginBottom: 10, letterSpacing: '-0.01em',
                }}>{title}</h3>
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link href="/upload" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: TEAL, color: '#FFFFFF',
              padding: '13px 32px', borderRadius: 12,
              fontSize: 15, fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(0,212,170,0.35)',
            }}>
              Get started free
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY LABCARD ────────────────────────────────────────────────────── */}
      <section style={{
        background: BG_TINT,
        padding: '80px 24px',
        borderTop: `1px solid ${BORDER}`,
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{
            textAlign: 'center', fontSize: 12, fontWeight: 600,
            color: TEAL_DARK, textTransform: 'uppercase',
            letterSpacing: '0.1em', marginBottom: 12,
          }}>Why LabCard AI</p>

          <h2 style={{
            textAlign: 'center',
            fontSize: 'clamp(22px, 3.5vw, 36px)',
            fontWeight: 700, color: NAVY,
            letterSpacing: '-0.02em',
            maxWidth: 640, margin: '0 auto 52px',
            lineHeight: 1.3,
          }}>
            Function Health charges $499/yr for this in the USA.
            <br />
            <span style={{ color: TEAL }}>We bring it to every Indian — at ₹199/month.</span>
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
          }}>
            {[
              {
                icon: '🔒',
                title: 'Private by design',
                desc: 'Nothing stored. Analysis happens and it\'s gone.',
              },
              {
                icon: '⚡',
                title: 'Works in 10 seconds',
                desc: 'Plain-language context for your next doctor visit.',
              },
              {
                icon: '🇮🇳',
                title: 'Made for real India',
                desc: 'Hindi responses, Indian foods, Indian labs.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{
                background: BG,
                border: `1px solid ${BORDER_GRAY}`,
                borderRadius: 14,
                padding: '28px 22px',
                display: 'flex', flexDirection: 'column', gap: 10,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{ fontSize: 28 }}>{icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: NAVY, margin: 0 }}>{title}</h3>
                <p style={{ fontSize: 14, color: MUTED, margin: 0, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #F0FEFA 0%, #FFFFFF 100%)',
        padding: '80px 24px',
        borderTop: `1px solid ${BORDER}`,
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <p style={{
            fontSize: 12, fontWeight: 600, color: TEAL_DARK,
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16,
          }}>No sign-up required</p>

          <h2 style={{
            fontSize: 'clamp(26px, 4vw, 40px)',
            fontWeight: 700, color: NAVY,
            letterSpacing: '-0.02em',
            lineHeight: 1.2, marginBottom: 16,
          }}>
            Your health, finally in plain language.
          </h2>

          <p style={{ fontSize: 16, color: MUTED, marginBottom: 36, lineHeight: 1.65 }}>
            Upload your report — see your health card and biological age in 10 seconds.
          </p>

          <div style={{
            display: 'flex', gap: 12, justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <Link href="/upload" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: TEAL, color: '#FFFFFF',
              padding: '14px 32px', borderRadius: 12,
              fontSize: 15, fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(0,212,170,0.35)',
            }}>
              Upload Report
            </Link>
            <Link href="/upload?demo=true" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'transparent', color: TEAL_DARK,
              padding: '14px 28px', borderRadius: 12,
              fontSize: 15, fontWeight: 700, textDecoration: 'none',
              border: `2px solid ${TEAL}`,
            }}>
              Try with demo data ▶
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer style={{
        background: BG,
        borderTop: `1px solid ${BORDER}`,
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        textAlign: 'center',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          <span style={{ fontSize: 16 }}>🩺</span>
          <span style={{ fontWeight: 700, fontSize: 15, color: NAVY }}>
            LabCard<span style={{ color: TEAL }}>AI</span>
          </span>
        </Link>

        {/* Disclaimer */}
        <p style={{ fontSize: 12, color: '#94A3B8', maxWidth: 520, margin: 0, lineHeight: 1.6 }}>
          For educational purposes only. LabCard AI does not provide medical diagnosis or treatment.
          <br />
          Always consult a qualified doctor before making health decisions.
        </p>

        <p style={{ fontSize: 11, color: '#CBD5E1', margin: 0 }}>
          © {new Date().getFullYear()} LabCard AI · Built at OpenAI × Outskill Hackathon 2026
        </p>
      </footer>
    </div>
  );
}
