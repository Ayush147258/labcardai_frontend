// ─────────────────────────────────────────────────────────────────────────────
// LabCard AI — 404 Not Found
// Light theme consistent with rest of app
// ─────────────────────────────────────────────────────────────────────────────

import Link from 'next/link';

export default function NotFound(): React.ReactElement {
  return (
    <main style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      minHeight:      '100vh',
      background:     '#F8FFFE',
      gap:            16,
      fontFamily:     "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
      padding:        '24px',
      textAlign:      'center',
    }}>
      {/* Icon */}
      <div style={{
        width:          72, height: 72,
        borderRadius:   '50%',
        background:     'rgba(0,212,170,0.10)',
        border:         '1.5px solid rgba(0,212,170,0.22)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       32,
        marginBottom:   4,
      }}>
        🔬
      </div>

      {/* Heading */}
      <h1 style={{
        fontSize:      28,
        fontWeight:    700,
        color:         '#0A1628',
        margin:        0,
        letterSpacing: '-0.02em',
      }}>
        404 — Report not found
      </h1>

      {/* Sub */}
      <p style={{
        fontSize:  15,
        color:     '#64748B',
        margin:    0,
        maxWidth:  320,
        lineHeight: 1.6,
      }}>
        This health card doesn&apos;t exist. It may have expired or the link is incorrect.
      </p>

      {/* CTA */}
      <Link
        href="/"
        style={{
          marginTop:    8,
          display:      'inline-flex',
          alignItems:   'center',
          gap:          6,
          background:   '#00D4AA',
          color:        '#FFFFFF',
          padding:      '11px 24px',
          borderRadius: 10,
          fontWeight:   600,
          fontSize:     14,
          textDecoration: 'none',
          boxShadow:    '0 3px 10px rgba(0,212,170,0.28)',
        }}
      >
        ← Go Home
      </Link>

      {/* Secondary link */}
      <Link
        href="/upload"
        style={{
          fontSize:       13,
          color:          '#64748B',
          textDecoration: 'underline',
          textUnderlineOffset: 3,
        }}
      >
        Upload a new report
      </Link>
    </main>
  );
}
