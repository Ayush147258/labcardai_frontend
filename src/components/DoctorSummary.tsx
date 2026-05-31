'use client';

// ─────────────────────────────────────────────────────────────────────────────
// LabCard AI — DoctorSummary Component
// Clinical handoff card — light theme, blue left accent
// ─────────────────────────────────────────────────────────────────────────────

interface DoctorSummaryProps {
  doctorNote:  string;
  topPriority: string;
}

export default function DoctorSummary({ doctorNote, topPriority }: DoctorSummaryProps): React.ReactElement {
  return (
    <div style={{
      background:   '#FFFFFF',
      border:       '1px solid rgba(37,99,235,0.15)',
      borderLeft:   '3px solid #2563EB',
      borderRadius: 12,
      padding:      '18px 20px',
      boxShadow:    '0 1px 3px rgba(0,0,0,0.04)',
      fontFamily:   "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
    }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          8,
        marginBottom: 14,
      }}>
        <div style={{
          width:          32,
          height:         32,
          borderRadius:   8,
          background:     'rgba(37,99,235,0.08)',
          border:         '1px solid rgba(37,99,235,0.18)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontSize:       15,
          flexShrink:     0,
        }}>📋</div>
        <span style={{
          fontSize:    14,
          fontWeight:  600,
          color:       '#1E40AF',
          letterSpacing: '0.01em',
        }}>
          For Your Doctor
        </span>
      </div>

      {/* ── Top priority ───────────────────────────────────────────────────── */}
      {topPriority && (
        <div style={{
          background:   'rgba(37,99,235,0.05)',
          border:       '1px solid rgba(37,99,235,0.12)',
          borderRadius: 8,
          padding:      '10px 12px',
          marginBottom: 12,
        }}>
          <span style={{
            fontSize:   11,
            fontWeight: 700,
            color:      '#3B82F6',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            display:    'block',
            marginBottom: 4,
          }}>
            Top Finding
          </span>
          <p style={{
            fontSize:   13,
            fontWeight: 600,
            color:      '#0A1628',
            margin:     0,
            lineHeight: 1.5,
          }}>
            {topPriority}
          </p>
        </div>
      )}

      {/* ── Clinical note ──────────────────────────────────────────────────── */}
      {doctorNote && (
        <p style={{
          fontSize:     13,
          color:        '#475569',
          lineHeight:   1.7,
          margin:       '0 0 12px',
        }}>
          {doctorNote}
        </p>
      )}

      {/* ── Footer note ────────────────────────────────────────────────────── */}
      <p style={{
        fontSize:   12,
        color:      '#94A3B8',
        fontStyle:  'italic',
        margin:     0,
        lineHeight: 1.5,
      }}>
        Share this card with your doctor at your next appointment.
      </p>
    </div>
  );
}
