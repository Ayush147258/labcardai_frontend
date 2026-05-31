'use client';

import type { Biomarker } from '@/lib/types';
import { getHealthStatusLabel, getHealthStatusTier } from '@/lib/health-status';

interface BiomarkerCardProps {
  biomarker: Biomarker;
  lang:      'en' | 'hi';
}

const TIER_CONFIG = {
  optimal: {
    border:     '#16a34a',
    bg:         'rgba(34,197,94,0.06)',
    badgeBg:    'rgba(22,163,74,0.10)',
    badgeColor: '#15803d',
    textColor:  '#15803d',
    pulse:      false,
  },
  needs_attention: {
    border:     '#ca8a04',
    bg:         'rgba(234,179,8,0.06)',
    badgeBg:    'rgba(202,138,4,0.10)',
    badgeColor: '#92400e',
    textColor:  '#92400e',
    pulse:      false,
  },
  action_required: {
    border:     '#dc2626',
    bg:         'rgba(239,68,68,0.08)',
    badgeBg:    'rgba(220,38,38,0.12)',
    badgeColor: '#b91c1c',
    textColor:  '#b91c1c',
    pulse:      false,
  },
} as const;

function getReferenceRange(biomarker: Biomarker): string {
  return (
    biomarker.normalRangeText ||
    biomarker.normalRange ||
    ''
  ).trim();
}

export default function BiomarkerCard({ biomarker, lang }: BiomarkerCardProps): React.ReactElement {
  const tier = getHealthStatusTier(biomarker.status);
  const cfg = TIER_CONFIG[tier];
  const isPulse = biomarker.status === 'Critical';
  const statusLabel = getHealthStatusLabel(biomarker.status);
  const refRange = getReferenceRange(biomarker);
  const isOptimal = tier === 'optimal';

  const explanation = lang === 'hi'
    ? (biomarker.explanationHindi || biomarker.explanation)
    : biomarker.explanation;

  return (
    <>
      <style>{`
        .bm-wrapper { position: relative; }
        .bm-tooltip {
          display: none;
          position: absolute;
          bottom: calc(100% + 8px);
          left: 0;
          z-index: 50;
          background: #0A1628;
          color: #F0F4F8;
          font-size: 12px;
          line-height: 1.6;
          padding: 8px 12px;
          border-radius: 8px;
          max-width: 260px;
          min-width: 180px;
          pointer-events: none;
          box-shadow: 0 4px 16px rgba(0,0,0,0.18);
          white-space: normal;
          word-break: break-word;
          font-family: 'Plus Jakarta Sans', Inter, system-ui, sans-serif;
        }
        .bm-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 16px;
          border: 5px solid transparent;
          border-top-color: #0A1628;
        }
        .bm-wrapper:hover .bm-tooltip { display: block; }
      `}</style>

      {isPulse && (
        <style>{`
          @keyframes bm-critical-pulse {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.82; }
          }
          .bm-critical { animation: bm-critical-pulse 1.5s ease-in-out infinite; }
        `}</style>
      )}

      <div
        className={`bm-wrapper${isPulse ? ' bm-critical' : ''}`}
        data-health-tier={tier}
        style={{
          background:   cfg.bg,
          border:       `1px solid ${cfg.border}40`,
          borderLeft:   `4px solid ${cfg.border}`,
          borderRadius: 10,
          padding:      '14px 14px 12px',
          position:     'relative',
          fontFamily:   "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
          boxShadow:    '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        {biomarker.explanationHindi && (
          <div className="bm-tooltip">
            🇮🇳 {biomarker.explanationHindi}
          </div>
        )}

        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: '#F1F5F9', color: '#64748B',
          borderRadius: 20, padding: '2px 8px',
          fontSize: 10, fontWeight: 600,
          letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>
          {biomarker.category}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 8, paddingRight: 80, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#0A1628', lineHeight: 1.3 }}>
            {biomarker.name}
          </span>
          <span style={{
            background: cfg.badgeBg, color: cfg.badgeColor,
            border: `1px solid ${cfg.border}55`,
            borderRadius: 20, padding: '3px 10px',
            fontSize: 11, fontWeight: 700, flexShrink: 0,
          }}>
            {statusLabel}
          </span>
        </div>

        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 6,
          marginBottom: refRange ? 4 : 10, flexWrap: 'wrap',
        }}>
          <span style={{
            fontSize: 28, fontWeight: 700, color: cfg.textColor,
            lineHeight: 1, letterSpacing: '-0.02em',
          }}>
            {biomarker.value}
          </span>
          {biomarker.unit && (
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
              {biomarker.unit}
            </span>
          )}
        </div>

        {refRange && (
          <p style={{
            fontSize: 12,
            color: isOptimal ? '#94A3B8' : '#64748B',
            margin: '0 0 10px',
            fontWeight: 500,
          }}>
            {isOptimal ? `Normal: ${refRange}` : `Reference: ${refRange}`}
          </p>
        )}

        {explanation && (
          <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: '0 0 8px' }}>
            {explanation}
          </p>
        )}

        {biomarker.advice && (
          <p style={{
            fontSize: 12, color: cfg.textColor, lineHeight: 1.5,
            margin: '0 0 8px', display: 'flex', alignItems: 'flex-start', gap: 5,
          }}>
            <span style={{ flexShrink: 0 }}>💡</span>
            <span>{biomarker.advice}</span>
          </p>
        )}

        {biomarker.indianFoods && biomarker.indianFoods.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
            {biomarker.indianFoods.map((food) => (
              <span
                key={food}
                style={{
                  background: 'rgba(234,88,12,0.08)', color: '#c2410c',
                  border: '1px solid rgba(234,88,12,0.20)',
                  borderRadius: 20, padding: '3px 9px',
                  fontSize: 11, fontWeight: 500,
                }}
              >
                🍽 {food}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
