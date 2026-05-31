'use client';

// ─────────────────────────────────────────────────────────────────────────────
// LabCard AI — HealthGauge Component
// SVG semicircular speedometer gauge, animates on mount
// Light theme: renders inside a white card — text is dark (#0A1628)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';

interface HealthGaugeProps {
  score: number;          // 0–100
  grade: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
  size?: number;          // default 140 — scales the wrapper div
}

// Arc geometry (fixed — viewBox is always 0 0 140 80)
// Path: M 15 70 A 55 55 0 0 1 125 70  →  semicircle, total length ≈ 173px
const ARC_PATH        = 'M 15 70 A 55 55 0 0 1 125 70';
const ARC_TOTAL       = 172.8;   // actual path length (π × 55)
const ANIM_DURATION   = 800;     // ms

// Grade → arc fill color
const GRADE_COLORS: Record<HealthGaugeProps['grade'], string> = {
  Excellent: '#16a34a',   // green-600  (readable on white)
  Good:      '#00D4AA',   // LabCard teal
  Fair:      '#ca8a04',   // amber-600  (readable on white)
  Poor:      '#ea580c',   // orange-600
  Critical:  '#dc2626',   // red-600
};

// Grade → label color (slightly muted vs arc so text doesn't fight)
const GRADE_LABEL_COLORS: Record<HealthGaugeProps['grade'], string> = {
  Excellent: '#15803d',
  Good:      '#00B896',
  Fair:      '#b45309',
  Poor:      '#c2410c',
  Critical:  '#b91c1c',
};

export default function HealthGauge({ score, grade, size = 140 }: HealthGaugeProps): React.ReactElement {
  const arcRef = useRef<SVGPathElement>(null);
  const [displayScore, setDisplayScore] = useState(0);

  const arcColor  = GRADE_COLORS[grade];
  const lblColor  = GRADE_LABEL_COLORS[grade];
  const clampedScore = Math.max(0, Math.min(100, score));

  useEffect(() => {
    // ── Animate arc stroke-dashoffset ─────────────────────────────────────
    const arcEl      = arcRef.current;
    if (!arcEl) return;

    const targetOffset  = ARC_TOTAL - (clampedScore / 100) * ARC_TOTAL;
    const startOffset   = ARC_TOTAL; // fully hidden at start
    const startTime     = performance.now();

    // Counter animation (0 → score)
    let scoreRaf: number;
    const animateScore = (now: number) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / ANIM_DURATION, 1);
      // linear easing
      const current  = Math.round(progress * clampedScore);
      setDisplayScore(current);
      if (progress < 1) scoreRaf = requestAnimationFrame(animateScore);
    };

    // Arc animation (dashoffset ARC_TOTAL → targetOffset)
    let arcRaf: number;
    const animateArc = (now: number) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / ANIM_DURATION, 1);
      const offset   = startOffset + (targetOffset - startOffset) * progress;
      arcEl.style.strokeDashoffset = String(offset);
      if (progress < 1) arcRaf = requestAnimationFrame(animateArc);
    };

    // Set initial dasharray so arc is fully drawn but hidden
    arcEl.style.strokeDasharray  = String(ARC_TOTAL);
    arcEl.style.strokeDashoffset = String(ARC_TOTAL);

    scoreRaf = requestAnimationFrame(animateScore);
    arcRaf   = requestAnimationFrame(animateArc);

    return () => {
      cancelAnimationFrame(scoreRaf);
      cancelAnimationFrame(arcRaf);
    };
  }, [clampedScore]);

  // Scale factor — viewBox is fixed 140×80, wrapper scales via CSS
  const scale = size / 140;

  return (
    <div
      style={{
        width:  size,
        height: size * (80 / 140),   // maintain aspect ratio
        position: 'relative',
        display: 'inline-block',
      }}
      role="img"
      aria-label={`Health score: ${clampedScore} out of 100, grade: ${grade}`}
    >
      <svg
        viewBox="0 0 140 80"
        width={size}
        height={size * (80 / 140)}
        style={{ overflow: 'visible' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Background track arc ────────────────────────────────────────── */}
        <path
          d={ARC_PATH}
          fill="none"
          stroke="#E2E8F0"          // slate-200 — subtle on white card
          strokeWidth={10}
          strokeLinecap="round"
        />

        {/* ── Filled / animated arc ────────────────────────────────────────── */}
        <path
          ref={arcRef}
          d={ARC_PATH}
          fill="none"
          stroke={arcColor}
          strokeWidth={10}
          strokeLinecap="round"
          style={{
            strokeDasharray:  ARC_TOTAL,
            strokeDashoffset: ARC_TOTAL,
            transition: 'none',     // RAF-driven, no CSS transition
            filter: `drop-shadow(0 0 4px ${arcColor}55)`,
          }}
        />

        {/* ── Score number (center of arc) ────────────────────────────────── */}
        <text
          x="70"
          y="60"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#0A1628"            // dark navy — readable on white card
          fontSize={Math.round(24 * scale)}
          fontWeight="700"
          fontFamily="'Plus Jakarta Sans', Inter, system-ui, sans-serif"
          style={{ letterSpacing: '-0.03em' }}
        >
          {displayScore}
        </text>

        {/* ── Grade label below score ──────────────────────────────────────── */}
        <text
          x="70"
          y={60 + Math.round(16 * scale)}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={lblColor}
          fontSize={Math.round(9 * scale)}
          fontWeight="600"
          fontFamily="'Plus Jakarta Sans', Inter, system-ui, sans-serif"
          style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
        >
          {grade}
        </text>
      </svg>
    </div>
  );
}
