// ─────────────────────────────────────────────────────────────────────────────
// LabCard AI — Health status tiers (Optimal / Needs Attention / Action Required)
// Maps backend biomarker statuses → user-facing filter & card labels
// ─────────────────────────────────────────────────────────────────────────────

import type { Biomarker } from '@/lib/types';

export type HealthStatusTier = 'all' | 'optimal' | 'needs_attention' | 'action_required';

export const HEALTH_STATUS_LABELS = {
  optimal: '🟢 Optimal',
  needs_attention: '🟡 Needs Attention',
  action_required: '🔴 Action Required',
} as const;

const ACTION_REQUIRED: Biomarker['status'][] = ['Critical', 'Low', 'Deficient'];
const NEEDS_ATTENTION: Biomarker['status'][] = ['High', 'Elevated'];

export function getHealthStatusTier(status: Biomarker['status']): Exclude<HealthStatusTier, 'all'> {
  if (status === 'Normal') return 'optimal';
  if (NEEDS_ATTENTION.includes(status)) return 'needs_attention';
  return 'action_required';
}

export function getHealthStatusLabel(status: Biomarker['status']): string {
  return HEALTH_STATUS_LABELS[getHealthStatusTier(status)];
}

export function countByHealthTier(biomarkers: Biomarker[]): Record<Exclude<HealthStatusTier, 'all'>, number> {
  return biomarkers.reduce(
    (acc, b) => {
      acc[getHealthStatusTier(b.status)] += 1;
      return acc;
    },
    { optimal: 0, needs_attention: 0, action_required: 0 }
  );
}

export function filterBiomarkers(
  biomarkers: Biomarker[],
  statusFilter: HealthStatusTier,
  categoryTab: string
): Biomarker[] {
  let list = biomarkers;

  if (categoryTab !== 'All') {
    list = list.filter((b) => b.category === categoryTab);
  }

  if (statusFilter === 'all') return list;

  return list.filter((b) => getHealthStatusTier(b.status) === statusFilter);
}

export const STATUS_FILTER_STYLES: Record<
  HealthStatusTier,
  { activeBg: string; activeColor: string; activeBorder: string; dot?: string }
> = {
  all: {
    activeBg: '#F1F5F9',
    activeColor: '#0A1628',
    activeBorder: '#94A3B8',
  },
  optimal: {
    activeBg: 'rgba(22,163,74,0.12)',
    activeColor: '#15803d',
    activeBorder: '#16a34a',
    dot: '🟢',
  },
  needs_attention: {
    activeBg: 'rgba(234,179,8,0.12)',
    activeColor: '#92400e',
    activeBorder: '#ca8a04',
    dot: '🟡',
  },
  action_required: {
    activeBg: 'rgba(220,38,38,0.10)',
    activeColor: '#b91c1c',
    activeBorder: '#dc2626',
    dot: '🔴',
  },
};
