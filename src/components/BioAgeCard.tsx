'use client';

// ─────────────────────────────────────────────────────────────────────────────
// LabCard AI — BioAgeCard Component
// Premium dark card (contrast element on light page) showing biological vs
// chronological age with 3-step improvement protocol
// Dark bg (#0D1B2A) is intentional — creates visual hierarchy on white page
// ─────────────────────────────────────────────────────────────────────────────

interface BioAgeCardProps {
  biologicalAge:    number;
  chronologicalAge: number;   // 0 if unknown / not in report
  insight:          string;
  protocol:         string[];
}

// ── Theme helpers ─────────────────────────────────────────────────────────────

type AgeTheme = 'younger' | 'older' | 'neutral';

function getTheme(bio: number, chrono: number): AgeTheme {
  if (chrono === 0) return 'neutral';
  if (bio < chrono)  return 'younger';
  if (bio > chrono)  return 'older';
  return 'neutral';
}

const THEME_STYLES: Record<AgeTheme, {
  border:    string;
  ageColor:  string;
  tagBg:     string;
  tagColor:  string;
  tagBorder: string;
  tagText:   string;
  tagIcon:   string;
}> = {
  younger: {
    border:    '#22c55e',
    ageColor:  '#4ade80',          // green-400 — readable on dark bg
    tagBg:     'rgba(34,197,94,0.12)',
    tagColor:  '#4ade80',
    tagBorder: 'rgba(34,197,94,0.30)',
    tagText:   'Your body is younger!',
    tagIcon:   '✓',
  },
  older: {
    border:    '#eab308',
    ageColor:  '#facc15',          // yellow-400 — readable on dark bg
    tagBg:     'rgba(234,179,8,0.12)',
    tagColor:  '#facc15',
    tagBorder: 'rgba(234,179,8,0.30)',
    tagText:   "Here's your protocol",
    tagIcon:   '↑',
  },
  neutral: {
    border:    '#00D4AA',
    ageColor:  '#00D4AA',          // LabCard teal
    tagBg:     'rgba(0,212,170,0.12)',
    tagColor:  '#00D4AA',
    tagBorder: 'rgba(0,212,170,0.30)',
    tagText:   'Keep it up!',
    tagIcon:   '✓',
  },
};

export default function BioAgeCard({
  biologicalAge,
  chronologicalAge,
  insight,
  protocol,
}: BioAgeCardProps): React.ReactElement {
  const theme      = getTheme(biologicalAge, chronologicalAge);
  const styles     = THEME_STYLES[theme];
  const showVsView = chronologicalAge > 0;

  return (
    <div
      style={{
        background:   '#0D1B2A',
        border:       `1.5px solid ${styles.border}`,
        borderRadius: 16,
        padding:      '24px 24px 20px',
        boxShadow:    `0 4px 24px rgba(0,0,0,0.15), 0 0 0 1px ${styles.border}22`,
        width:        '100%',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        marginBottom:   20,
      }}>
        <span style={{
          fontSize:    13,
          fontWeight:  600,
          color:       '#94A3B8',
          letterSpacing: '0.04em',
          display:     'flex',
          alignItems:  'center',
          gap:         6,
        }}>
          🧬 Biological Age
        </span>

        {/* Bottom outcome tag — shown in header-right for visual balance */}
        <span style={{
          display:      'inline-flex',
          alignItems:   'center',
          gap:          5,
          background:   styles.tagBg,
          color:        styles.tagColor,
          border:       `1px solid ${styles.tagBorder}`,
          borderRadius: 20,
          padding:      '4px 10px',
          fontSize:     12,
          fontWeight:   600,
        }}>
          {styles.tagIcon} {styles.tagText}
        </span>
      </div>

      {/* ── Age numbers ────────────────────────────────────────────────────── */}
      {showVsView ? (
        // Side-by-side: Bio vs Chrono
        <div style={{
          display:    'flex',
          alignItems: 'center',
          gap:        20,
          marginBottom: 18,
        }}>
          {/* Biological age — large */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize:      48,
              fontWeight:    700,
              color:         styles.ageColor,
              lineHeight:    1,
              letterSpacing: '-0.04em',
              fontFamily:    "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
            }}>
              {biologicalAge}
            </div>
            <div style={{
              fontSize:   11,
              color:      '#64748B',
              fontWeight: 500,
              marginTop:  4,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              Biological
            </div>
          </div>

          {/* VS separator */}
          <div style={{
            fontSize:   13,
            fontWeight: 700,
            color:      '#334155',
            flexShrink: 0,
            padding:    '0 4px',
          }}>
            vs
          </div>

          {/* Chronological age — smaller, muted */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize:      36,
              fontWeight:    600,
              color:         '#475569',
              lineHeight:    1,
              letterSpacing: '-0.03em',
              fontFamily:    "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
            }}>
              {chronologicalAge}
            </div>
            <div style={{
              fontSize:   11,
              color:      '#64748B',
              fontWeight: 500,
              marginTop:  4,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              Actual Age
            </div>
          </div>
        </div>
      ) : (
        // Centered single age when chrono unknown
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{
            fontSize:      56,
            fontWeight:    700,
            color:         styles.ageColor,
            lineHeight:    1,
            letterSpacing: '-0.04em',
            fontFamily:    "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
          }}>
            {biologicalAge}
          </div>
          <div style={{
            fontSize:      12,
            color:         '#64748B',
            fontWeight:    500,
            marginTop:     6,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            Estimated Biological Age
          </div>
        </div>
      )}

      {/* ── Insight sentence ───────────────────────────────────────────────── */}
      {insight && (
        <p style={{
          fontSize:    13,
          color:       '#94A3B8',
          fontStyle:   'italic',
          lineHeight:  1.6,
          margin:      '0 0 18px',
          paddingLeft: 2,
        }}>
          {insight}
        </p>
      )}

      {/* ── Divider ────────────────────────────────────────────────────────── */}
      <div style={{
        height:       1,
        background:   'rgba(148,163,184,0.12)',
        marginBottom: 18,
      }} />

      {/* ── Protocol heading ───────────────────────────────────────────────── */}
      <div style={{
        fontSize:      11,
        fontWeight:    700,
        color:         '#00D4AA',
        textTransform: 'uppercase',
        letterSpacing: '0.10em',
        marginBottom:  14,
      }}>
        3-Step Improvement Protocol
      </div>

      {/* ── Protocol steps ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {protocol.slice(0, 3).map((step, i) => (
          <div
            key={i}
            style={{
              display:    'flex',
              alignItems: 'flex-start',
              gap:        12,
            }}
          >
            {/* Number circle */}
            <div style={{
              flexShrink:     0,
              width:          24,
              height:         24,
              borderRadius:   '50%',
              background:     'rgba(0,212,170,0.15)',
              border:         '1.5px solid rgba(0,212,170,0.40)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              fontSize:       11,
              fontWeight:     700,
              color:          '#00D4AA',
              marginTop:      1,
            }}>
              {i + 1}
            </div>

            {/* Step text */}
            <p style={{
              fontSize:   13,
              color:      '#CBD5E1',
              lineHeight: 1.6,
              margin:     0,
              flex:       1,
            }}>
              {step}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
