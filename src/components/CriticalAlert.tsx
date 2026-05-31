'use client';

// ─────────────────────────────────────────────────────────────────────────────
// LabCard AI — CriticalAlert Component
// Full-width red alert banner for life-threatening biomarker values
// Light theme consistent — red on white, NOT dark bg
// ─────────────────────────────────────────────────────────────────────────────

interface CriticalAlertProps {
  show:      boolean;
  alertText: string;
}

export default function CriticalAlert({ show, alertText }: CriticalAlertProps): React.ReactElement | null {
  if (!show) return null;

  return (
    <>
      {/* Keyframe injected once — scoped to this component */}
      <style>{`
        @keyframes alert-pulse {
          0%, 100% { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.10); }
          50%       { border-color: #fca5a5; box-shadow: 0 0 0 6px rgba(239,68,68,0.06); }
        }
        .labcard-critical-banner {
          animation: alert-pulse 2s ease-in-out infinite;
        }
      `}</style>

      <div
        className="labcard-critical-banner"
        role="alert"
        aria-live="assertive"
        style={{
          width:        '100%',
          background:   'rgba(239,68,68,0.07)',
          border:       '1.5px solid #ef4444',
          borderRadius: 12,
          padding:      '16px 20px',
          // animation via className above
        }}
      >
        {/* ── Top row: heading ───────────────────────────────────────────── */}
        <div style={{
          display:    'flex',
          alignItems: 'center',
          gap:        10,
          marginBottom: 8,
        }}>
          {/* Icon badge */}
          <div style={{
            flexShrink:     0,
            width:          32,
            height:         32,
            borderRadius:   '50%',
            background:     'rgba(239,68,68,0.12)',
            border:         '1.5px solid rgba(239,68,68,0.35)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       16,
          }}>
            ⚠️
          </div>

          <span style={{
            fontSize:      15,
            fontWeight:    700,
            color:         '#b91c1c',        // red-700 — readable on white bg
            letterSpacing: '0.01em',
            fontFamily:    "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
          }}>
            IMMEDIATE ACTION REQUIRED
          </span>
        </div>

        {/* ── Alert text ─────────────────────────────────────────────────── */}
        <p style={{
          fontSize:    14,
          color:       '#dc2626',             // red-600
          lineHeight:  1.65,
          margin:      '0 0 10px 42px',       // indent to align with heading text
          fontFamily:  "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
        }}>
          {alertText}
        </p>

        {/* ── Bottom action line ─────────────────────────────────────────── */}
        <div style={{
          display:    'flex',
          alignItems: 'center',
          gap:        8,
          marginLeft: 42,                     // same indent
        }}>
          {/* Pulse dot */}
          <div style={{
            width:        8,
            height:       8,
            borderRadius: '50%',
            background:   '#ef4444',
            flexShrink:   0,
            boxShadow:    '0 0 0 3px rgba(239,68,68,0.20)',
          }} />

          <p style={{
            fontSize:   12,
            fontWeight: 700,
            color:      '#b91c1c',
            margin:     0,
            fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
          }}>
            Please seek medical attention immediately. Show this report to a doctor.
          </p>
        </div>
      </div>
    </>
  );
}
