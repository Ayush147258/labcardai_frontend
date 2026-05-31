'use client';

import type { Biomarker } from '@/lib/types';
import { countByHealthTier, HEALTH_STATUS_LABELS } from '@/lib/health-status';

interface HealthStatusOverviewProps {
  biomarkers: Biomarker[];
  compact?: boolean;
}

export default function HealthStatusOverview({
  biomarkers,
  compact = false,
}: HealthStatusOverviewProps): React.ReactElement {
  const counts = countByHealthTier(biomarkers);
  const total = biomarkers.length;
  const optimalPct = total ? Math.round((counts.optimal / total) * 100) : 0;
  const attentionPct = total ? Math.round((counts.needs_attention / total) * 100) : 0;
  const actionPct = total ? Math.round((counts.action_required / total) * 100) : 0;

  const segments = [
    { key: 'optimal', count: counts.optimal, pct: optimalPct, color: '#16a34a', label: HEALTH_STATUS_LABELS.optimal },
    { key: 'needs_attention', count: counts.needs_attention, pct: attentionPct, color: '#ca8a04', label: HEALTH_STATUS_LABELS.needs_attention },
    { key: 'action_required', count: counts.action_required, pct: actionPct, color: '#dc2626', label: HEALTH_STATUS_LABELS.action_required },
  ].filter((s) => s.count > 0);

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E8F5F2',
        borderRadius: 12,
        padding: compact ? '14px 16px' : '18px 20px',
        fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
      }}
    >
      <p
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: '#64748B',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          margin: '0 0 12px',
        }}
      >
        Biomarker Status Overview
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 14,
        }}
      >
        <StatLine label={HEALTH_STATUS_LABELS.optimal} count={counts.optimal} color="#15803d" />
        <StatLine label={HEALTH_STATUS_LABELS.needs_attention} count={counts.needs_attention} color="#92400e" />
        <StatLine label={HEALTH_STATUS_LABELS.action_required} count={counts.action_required} color="#b91c1c" />
      </div>

      {total > 0 && (
        <>
          <div
            style={{
              display: 'flex',
              height: 10,
              borderRadius: 6,
              overflow: 'hidden',
              marginBottom: 8,
            }}
            aria-label="Health status distribution"
          >
            {segments.map((s) => (
              <div
                key={s.key}
                style={{
                  width: `${(s.count / total) * 100}%`,
                  background: s.color,
                  minWidth: s.count > 0 ? 4 : 0,
                }}
                title={`${s.label}: ${s.count}`}
              />
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 11, color: '#64748B' }}>
            {optimalPct > 0 && <span>{optimalPct}% Green</span>}
            {attentionPct > 0 && <span>{attentionPct}% Yellow</span>}
            {actionPct > 0 && <span>{actionPct}% Red</span>}
          </div>
        </>
      )}
    </div>
  );
}

function StatLine({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}): React.ReactElement {
  return (
    <div style={{ fontSize: 13, color: '#0A1628' }}>
      <span style={{ fontWeight: 600, color }}>{label}:</span>{' '}
      <span style={{ fontWeight: 700 }}>{count}</span>
    </div>
  );
}
