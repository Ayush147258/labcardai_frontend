'use client';

// ─────────────────────────────────────────────────────────────────────────────
// LabCard AI — Result Page
// Reads LabReport from sessionStorage, renders full health card
// Light theme: #FFFFFF bg, #0A1628 text, #00D4AA teal accent
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useRouter }           from 'next/navigation';
import type { LabReport, UserTier } from '@/lib/types';

// Components
import HealthGauge    from '@/components/HealthGauge';
import BiomarkerCard  from '@/components/BiomarkerCard';
import BioAgeCard     from '@/components/BioAgeCard';
import CriticalAlert  from '@/components/CriticalAlert';
import DoctorSummary  from '@/components/DoctorSummary';
import ExportActions  from '@/components/ExportActions';
import ChatPanel      from '@/components/ChatPanel';
import HealthStatusOverview from '@/components/HealthStatusOverview';
import {
  type HealthStatusTier,
  countByHealthTier,
  filterBiomarkers,
  STATUS_FILTER_STYLES,
  HEALTH_STATUS_LABELS,
} from '@/lib/health-status';

// ── Color constants ───────────────────────────────────────────────────────────
const TEAL        = '#00D4AA';
const TEAL_DARK   = '#00B896';
const TEAL_DIM    = 'rgba(0,212,170,0.08)';
const TEAL_BORDER = 'rgba(0,212,170,0.18)';
const NAVY        = '#0A1628';
const MUTED       = '#64748B';
const BG          = '#FFFFFF';
const BG_TINT     = '#F8FFFE';
const BORDER      = '#E8F5F2';
const BORDER_GRAY = '#F1F5F9';

// ── Category tabs config ──────────────────────────────────────────────────────
const ALL_TABS = ['All', 'Blood', 'Thyroid', 'Vitamin', 'Liver', 'Kidney', 'Sugar', 'Lipid', 'Other'] as const;

export default function ResultPage(): React.ReactElement {
  const router = useRouter();

  const [report,    setReport]    = useState<LabReport | null>(null);
  const [tier,      setTier]      = useState<UserTier>('free');
  const [lang,      setLang]      = useState<'en' | 'hi'>('en');
  const [activeTab, setActiveTab] = useState('All');
  const [statusFilter, setStatusFilter] = useState<HealthStatusTier>('all');
  const [isLoading, setIsLoading] = useState(true);

  // ── Load from sessionStorage ──────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('labcard_result');
      if (!raw) {
        router.push('/upload');
        return;
      }
      const parsed = JSON.parse(raw) as LabReport;
      setReport(parsed);

      const savedTier = sessionStorage.getItem('user_tier');
      setTier(savedTier === 'premium' ? 'premium' : 'free');
    } catch {
      router.push('/upload');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ background: BG_TINT, minHeight: '100vh', padding: '40px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[200, 120, 180, 240].map((h, i) => (
            <div key={i} style={{
              height: h, borderRadius: 12,
              background: 'linear-gradient(90deg, #F1F5F9, #E8F5F2, #F1F5F9)',
              animation: 'skeletonPulse 1.6s ease-in-out infinite',
            }} />
          ))}
        </div>
        <style>{`@keyframes skeletonPulse { 0%,100%{opacity:.35} 50%{opacity:.70} }`}</style>
      </div>
    );
  }

  if (!report) return <></>;

  const statusCounts = countByHealthTier(report.biomarkers);
  const totalBiomarkers = report.biomarkers.length;

  const presentCategories = Array.from(new Set(report.biomarkers.map((b) => b.category)));
  const visibleTabs = ALL_TABS.filter((t) => t === 'All' || presentCategories.includes(t as typeof presentCategories[number]));

  const filteredBiomarkers = filterBiomarkers(report.biomarkers, statusFilter, activeTab);

  const STATUS_FILTERS: { key: HealthStatusTier; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: totalBiomarkers },
    { key: 'optimal', label: HEALTH_STATUS_LABELS.optimal.replace('🟢 ', ''), count: statusCounts.optimal },
    { key: 'needs_attention', label: 'Needs Attention', count: statusCounts.needs_attention },
    { key: 'action_required', label: 'Action Required', count: statusCounts.action_required },
  ];

  function issuesInTab(tab: string): number {
    const bm = tab === 'All' ? report!.biomarkers : report!.biomarkers.filter((b) => b.category === tab);
    return bm.filter((b) => b.status !== 'Normal').length;
  }

  const summary = lang === 'hi' ? report.summaryHindi : report.summary;

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .fu1{animation:fadeUp .35s .00s ease-out both}
        @media(max-width:640px){
          .patient-gauge-grid { grid-template-columns: 1fr !important; }
          .patient-gauge-grid > *:last-child { display: flex; justify-content: center; }
          .result-tabs { gap: 4px !important; }
        }
        .fu2{animation:fadeUp .35s .07s ease-out both}
        .fu3{animation:fadeUp .35s .14s ease-out both}
        .fu4{animation:fadeUp .35s .21s ease-out both}
        .fu5{animation:fadeUp .35s .28s ease-out both}
        .fu6{animation:fadeUp .35s .35s ease-out both}
        .fu7{animation:fadeUp .35s .42s ease-out both}
        .fu8{animation:fadeUp .35s .49s ease-out both}
        .tab-btn:hover { background: ${TEAL_DIM} !important; color: ${TEAL_DARK} !important; }
        .lang-r:hover  { background: rgba(0,212,170,0.08) !important; }
      `}</style>

      <div style={{
        background: BG_TINT,
        minHeight:  '100vh',
        fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
        color:      NAVY,
      }}>

        {/* ── Sticky top bar ──────────────────────────────────────────────── */}
        <div style={{
          position:        'sticky', top: 0, zIndex: 40,
          background:      'rgba(255,255,255,0.92)',
          backdropFilter:  'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom:    `1px solid ${BORDER}`,
          padding:         '0 24px',
          height:          56,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'space-between',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🩺</span>
            <span style={{ fontWeight: 700, fontSize: 15, color: NAVY, letterSpacing: '-0.01em' }}>
              LabCard<span style={{ color: TEAL }}>AI</span>
            </span>
            {tier === 'premium' && (
              <span style={{
                background: 'linear-gradient(135deg,#FFD700,#FFA500)',
                color: '#7C5000', borderRadius: 20,
                padding: '2px 8px', fontSize: 10, fontWeight: 700,
              }}>⭐ Premium</span>
            )}
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Lang toggle */}
            <div style={{
              display: 'flex', background: BORDER_GRAY,
              borderRadius: 8, padding: 2, gap: 2,
            }}>
              {(['en', 'hi'] as const).map((l) => (
                <button
                  key={l}
                  className="lang-r"
                  onClick={() => setLang(l)}
                  style={{
                    padding: '4px 11px', borderRadius: 6, border: 'none',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    background: lang === l ? TEAL : 'transparent',
                    color:      lang === l ? '#FFFFFF' : MUTED,
                    transition: 'all 0.15s',
                    fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
                  }}
                >
                  {l === 'en' ? 'EN' : 'हिं'}
                </button>
              ))}
            </div>

            {/* New report button */}
            <button
              onClick={() => router.push('/upload')}
              style={{
                padding: '7px 14px', borderRadius: 8, border: `1px solid ${BORDER}`,
                background: BG, color: NAVY, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
              }}
            >
              + New Report
            </button>
          </div>
        </div>

        {/* ── Page body ───────────────────────────────────────────────────── */}
        <div style={{
          maxWidth: 960, margin: '0 auto',
          padding:  '24px 20px 60px',
          display:  'flex', flexDirection: 'column', gap: 20,
        }}>

          {/* Exportable report (PDF capture) */}
          <div
            id="labcard-report-export"
            style={{
              display: 'flex', flexDirection: 'column', gap: 20,
              background: BG_TINT, padding: 0,
            }}
          >

          {/* ── SECTION 1: Critical alert ──────────────────────────────── */}
          <div className="fu1"  style={{ animationDelay: '0ms' }}>
            <CriticalAlert
              show={report.hasCriticalAlert}
              alertText={report.criticalAlertText}
            />
          </div>

          {/* ── SECTION 2: Patient card + gauge ───────────────────────── */}
          <div className="fu2 patient-gauge-grid" style={{
            animationDelay: '100ms',
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) auto',
            gap: 20,
            alignItems: 'start',
          }}>
            {/* Patient info card */}
            <div style={{
              background: BG, border: `1px solid ${BORDER_GRAY}`,
              borderRadius: 14, padding: '20px 22px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'flex-start',
                justifyContent: 'space-between', marginBottom: 12,
              }}>
                <div>
                  <h1 style={{
                    fontSize: 20, fontWeight: 700, color: NAVY,
                    margin: '0 0 4px', letterSpacing: '-0.02em',
                  }}>
                    {report.patientName}
                  </h1>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 13, color: MUTED, flexWrap: 'wrap',
                  }}>
                    {[
                      report.patientAge ? `${report.patientAge}y` : null,
                      report.patientGender,
                      report.reportDate,
                      report.labName,
                    ].filter(Boolean).map((item, i, arr) => (
                      <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {item}
                        {i < arr.length - 1 && <span style={{ color: BORDER, fontWeight: 300 }}>·</span>}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <p style={{
                fontSize: 14, color: '#475569',
                lineHeight: 1.7, margin: '0 0 14px',
              }}>
                {summary}
              </p>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{
                  background: 'rgba(22,163,74,0.07)',
                  border: '1px solid rgba(22,163,74,0.20)',
                  color: '#15803d', borderRadius: 20,
                  padding: '4px 12px', fontSize: 12, fontWeight: 600,
                }}>
                  {HEALTH_STATUS_LABELS.optimal}: {statusCounts.optimal}
                </span>
                {statusCounts.needs_attention > 0 && (
                  <span style={{
                    background: 'rgba(234,179,8,0.08)',
                    border: '1px solid rgba(202,138,4,0.25)',
                    color: '#92400e', borderRadius: 20,
                    padding: '4px 12px', fontSize: 12, fontWeight: 600,
                  }}>
                    {HEALTH_STATUS_LABELS.needs_attention}: {statusCounts.needs_attention}
                  </span>
                )}
                {statusCounts.action_required > 0 && (
                  <span style={{
                    background: 'rgba(220,38,38,0.07)',
                    border: '1px solid rgba(220,38,38,0.20)',
                    color: '#b91c1c', borderRadius: 20,
                    padding: '4px 12px', fontSize: 12, fontWeight: 600,
                  }}>
                    {HEALTH_STATUS_LABELS.action_required}: {statusCounts.action_required}
                  </span>
                )}
              </div>
            </div>

            {/* Gauge card */}
            <div style={{
              background: BG, border: `1px solid ${BORDER_GRAY}`,
              borderRadius: 14, padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 8, minWidth: 160,
            }}>
              <HealthGauge
                score={report.healthScore}
                grade={report.healthGrade}
                size={140}
              />
              <span style={{
                fontSize: 11, fontWeight: 600, color: MUTED,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                Health Score
              </span>
            </div>
          </div>

          {/* ── SECTION 3: Bio Age card ───────────────────────────────── */}
          <div className="fu3"  style={{ animationDelay: '200ms' }}>
            <BioAgeCard
              biologicalAge={report.biologicalAge}
              chronologicalAge={report.chronologicalAge}
              insight={report.bioAgeInsight}
              protocol={report.bioAgeProtocol}
            />
          </div>

          {/* ── Status overview (PDF + dashboard) ───────────────────────── */}
          <div className="fu4">
            <HealthStatusOverview biomarkers={report.biomarkers} />
          </div>

          {/* ── Health status filters ─────────────────────────────────── */}
          <div className="fu4" style={{ animationDelay: '280ms' }}>
            <p style={{
              fontSize: 11, fontWeight: 700, color: MUTED,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              margin: '0 0 8px',
            }}>
              Health Status
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {STATUS_FILTERS.map(({ key, label, count }) => {
                const isActive = statusFilter === key;
                const style = STATUS_FILTER_STYLES[key];
                return (
                  <button
                    key={key}
                    type="button"
                    className="tab-btn"
                    onClick={() => setStatusFilter(key)}
                    style={{
                      padding: '6px 14px', borderRadius: 20,
                      border: isActive ? `1.5px solid ${style.activeBorder}` : `1px solid ${BORDER_GRAY}`,
                      background: isActive ? style.activeBg : BG,
                      color: isActive ? style.activeColor : MUTED,
                      fontSize: 12, fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                      fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
                    }}
                  >
                    {style.dot && <span>{style.dot}</span>}
                    {label} ({count})
                  </button>
                );
              })}
            </div>

            <p style={{
              fontSize: 11, fontWeight: 700, color: MUTED,
              textTransform: 'uppercase', letterSpacing: '0.08em',
              margin: '0 0 8px',
            }}>
              Categories
            </p>
            <div className="result-tabs" style={{
              display: 'flex', gap: 6, flexWrap: 'wrap',
              borderBottom: `1px solid ${BORDER}`,
              paddingBottom: 12,
            }}>
              {visibleTabs.map((tab) => {
                const issues  = issuesInTab(tab);
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    className="tab-btn"
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding:      '6px 14px',
                      borderRadius: 20,
                      border:       isActive ? `1.5px solid ${TEAL}` : `1px solid ${BORDER_GRAY}`,
                      background:   isActive ? TEAL_DIM : BG,
                      color:        isActive ? TEAL_DARK : MUTED,
                      fontSize:     12,
                      fontWeight:   isActive ? 700 : 500,
                      cursor:       'pointer',
                      transition:   'all 0.15s',
                      display:      'inline-flex',
                      alignItems:   'center',
                      gap:          5,
                      fontFamily:   "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
                    }}
                  >
                    {tab}
                    {issues > 0 && (
                      <span style={{
                        background:   isActive ? TEAL : 'rgba(220,38,38,0.10)',
                        color:        isActive ? '#FFFFFF' : '#b91c1c',
                        borderRadius: '50%',
                        width: 16, height: 16,
                        display: 'inline-flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700,
                      }}>
                        {issues}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── SECTION 5: Biomarker grid ─────────────────────────────── */}
          <div className="fu5" style={{
            animationDelay: '400ms',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 14,
          }}>
            {filteredBiomarkers.length > 0 ? (
              filteredBiomarkers.map((b, i) => (
                <BiomarkerCard key={`${b.name}-${i}`} biomarker={b} lang={lang} />
              ))
            ) : (
              <div style={{
                gridColumn: '1 / -1', padding: 24, textAlign: 'center',
                background: BG, border: `1px dashed ${BORDER}`, borderRadius: 12,
                color: MUTED, fontSize: 14,
              }}>
                No biomarkers match this filter. Try another status or category.
              </div>
            )}
          </div>

          {/* ── SECTION 6: Doctor summary ─────────────────────────────── */}
          <div className="fu6" style={{ animationDelay: '500ms' }}>
            <DoctorSummary
              doctorNote={report.doctorNote}
              topPriority={report.topPriority}
            />
          </div>

          </div>{/* end labcard-report-export */}

          {/* ── SECTION 7: AI Chat ────────────────────────────────────── */}
          <div className="fu7"  style={{ animationDelay: '600ms' }}>
            <ChatPanel
              reportData={JSON.stringify(report)}
              initialSummary={report.topPriority || report.summary}
              lang={lang}
              onLangChange={setLang}
              tier={tier}
            />
          </div>

          {/* ── SECTION 8: Export actions ─────────────────────────────── */}
          <div className="fu8"  style={{ animationDelay: '700ms' }}>
            <div style={{
              background: BG, border: `1px solid ${BORDER_GRAY}`,
              borderRadius: 14, padding: '20px 22px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <p style={{
                fontSize: 12, fontWeight: 600, color: MUTED,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                marginBottom: 14,
              }}>
                Share & Export
              </p>
              <ExportActions report={report} lang={lang} />
            </div>
          </div>

          {/* ── SECTION 9: Upgrade nudge (free only) ─────────────────── */}
          {tier === 'free' && (
            <div style={{
              background: TEAL_DIM,
              border: `1px solid ${TEAL_BORDER}`,
              borderRadius: 12, padding: '14px 18px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
            }}>
              <p style={{ fontSize: 13, color: NAVY, margin: 0, fontWeight: 500 }}>
                🔬 Analysed with free AI ·{' '}
                <span style={{ color: MUTED, fontWeight: 400 }}>
                  Upgrade for Claude-powered precision
                </span>
              </p>
              <button
                onClick={() => router.push('/pricing')}
                style={{
                  padding: '7px 16px', borderRadius: 8, border: 'none',
                  background: TEAL, color: '#FFFFFF',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,212,170,0.28)',
                  fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
                }}
              >
                Upgrade →
              </button>
            </div>
          )}


          {/* ── How to improve collapsible ─────────────────────────── */}
          {report.bioAgeProtocol && report.bioAgeProtocol.length > 0 && (
            <details style={{
              background:   '#FFFFFF',
              border:       '1px solid #E8F5F2',
              borderRadius: 12,
              overflow:     'hidden',
              fontFamily:   "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
            }}>
              <summary style={{
                padding:    '14px 18px',
                cursor:     'pointer',
                fontSize:   14,
                fontWeight: 600,
                color:      '#0A1628',
                display:    'flex',
                alignItems: 'center',
                gap:        8,
                listStyle:  'none',
                userSelect: 'none',
              }}>
                <span style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'rgba(0,212,170,0.10)',
                  border: '1px solid rgba(0,212,170,0.22)',
                  display: 'inline-flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 12, flexShrink: 0,
                }}>💡</span>
                How to improve your biological age
                <span style={{ marginLeft: 'auto', color: '#64748B', fontSize: 12 }}>
                  tap to expand
                </span>
              </summary>
              <div style={{
                padding:    '0 18px 18px',
                borderTop:  '1px solid #E8F5F2',
                paddingTop: 14,
              }}>
                <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 12px' }}>
                  Follow these steps to reduce your biological age:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {report.bioAgeProtocol.map((step, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                    }}>
                      <span style={{
                        flexShrink: 0,
                        width: 22, height: 22, borderRadius: '50%',
                        background: 'rgba(0,212,170,0.12)',
                        border: '1.5px solid rgba(0,212,170,0.30)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, color: '#00D4AA',
                        marginTop: 1,
                      }}>{i + 1}</span>
                      <p style={{ fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.6 }}>
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          )}

          {/* ── SECTION 10: Disclaimer ────────────────────────────────── */}
          <p style={{
            fontSize: 11, color: '#94A3B8',
            textAlign: 'center', lineHeight: 1.6,
            maxWidth: 600, margin: '0 auto',
          }}>
            LabCard AI is not a medical device and does not provide diagnosis or treatment.
            This analysis is for informational purposes only.
            Always consult a qualified healthcare professional before making any health decisions.
          </p>
        </div>
      </div>
    </>
  );
}
