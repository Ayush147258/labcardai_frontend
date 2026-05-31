'use client';

// ─────────────────────────────────────────────────────────────────────────────
// LabCard AI — Upload Page
// Drag & drop PDF or paste text → analyze → redirect to /result
// Light theme: #FFFFFF bg, #0A1628 text, #00D4AA teal accent
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams }               from 'next/navigation';
import { pingBackend, BACKEND_URL }                    from '@/lib/backend';
import Link                                         from 'next/link';
import type { UserTier }                            from '@/lib/types';

// ── Color constants ───────────────────────────────────────────────────────────
const TEAL        = '#00D4AA';
const TEAL_DARK   = '#00B896';
const TEAL_DIM    = 'rgba(0,212,170,0.06)';
const TEAL_BORDER = 'rgba(0,212,170,0.22)';
const NAVY        = '#0A1628';
const MUTED       = '#64748B';
const BG          = '#FFFFFF';
const BG_TINT     = '#F8FFFE';
const BORDER      = '#E8F5F2';
const BORDER_GRAY = '#F1F5F9';

// ── Loading steps ─────────────────────────────────────────────────────────────
const LOADING_STEPS = [
  'Reading your report...',
  'Detecting biomarkers...',
  'Calculating health score...',
  'Estimating biological age...',
  'Building your health card...',
];

export default function UploadPage(): React.ReactElement {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [file,        setFile]        = useState<File | null>(null);
  const [text,        setText]        = useState('');
  const [loading,     setLoading]     = useState(false);
  const [loadingStep, setLoadingStep] = useState(LOADING_STEPS[0]);
  const [error,       setError]       = useState<string | null>(null);
  const [tier,        setTier]        = useState<UserTier>('free');
  const [dragOver,    setDragOver]    = useState(false);
  const [upgraded,    setUpgraded]    = useState(false);
  const [backendReady, setBackendReady] = useState<boolean | null>(null); // null = checking

  const fileInputRef  = useRef<HTMLInputElement>(null);
  const stepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyzeRef    = useRef<((overrideText?: string, overrideFile?: File) => Promise<void>) | null>(null);

  // ── Analyze handler (defined with useCallback, stored in ref) ─────────────
  const handleAnalyze = useCallback(async (overrideText?: string, overrideFile?: File) => {
    const reportFile = overrideFile ?? file;
    const reportText = overrideText ?? text;
    if (!reportFile && !reportText.trim()) return;

    setLoading(true);
    setError(null);

    // Cycle loading steps
    let stepIdx = 0;
    setLoadingStep(LOADING_STEPS[0]);
    stepIntervalRef.current = setInterval(() => {
      stepIdx = (stepIdx + 1) % LOADING_STEPS.length;
      setLoadingStep(LOADING_STEPS[stepIdx]);
    }, 1200);

    try {
      const formData = new FormData();
      if (reportFile) {
        formData.append('file', reportFile);
      } else {
        formData.append('text', reportText.trim());
      }

      const res = await fetch('/api/analyze', {
        method:  'POST',
        headers: { 'x-user-tier': tier },
        body:    formData,
      });

      const result = await res.json() as Record<string, unknown>;

      if (!res.ok) {
        const msg = typeof result.error === 'string' ? result.error : 'Analysis failed. Please try again.';
        throw new Error(msg);
      }

      sessionStorage.setItem('labcard_result', JSON.stringify(result));
      router.push('/result');

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
      setLoading(false);
    } finally {
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
        stepIntervalRef.current = null;
      }
    }
  }, [file, text, tier, router]);

  // Keep ref current so demo auto-trigger can call latest version
  useEffect(() => {
    analyzeRef.current = handleAnalyze;
  }, [handleAnalyze]);

  // ── On mount: read tier, check ?demo=true, check ?upgraded=true ───────────
  useEffect(() => {
    // Warm up HF Spaces backend (pings /api/health on mount)
    // HF Spaces free tier sleeps after 48h — this wakes it before user uploads
    const warmBackend = async () => {
      try {
        const health = await pingBackend(5000);
        setBackendReady(health !== null && health.status === 'healthy');
      } catch {
        setBackendReady(false);
      }
    };
    void warmBackend();

    // Read tier
    const savedTier = sessionStorage.getItem('user_tier');
    const resolvedTier: UserTier = savedTier === 'premium' ? 'premium' : 'free';
    setTier(resolvedTier);

    // Upgraded banner
    const isUpgraded = searchParams.get('upgraded') === 'true';
    if (isUpgraded) {
      setUpgraded(true);
      // Clear param from URL after 3s
      setTimeout(() => {
        setUpgraded(false);
        router.replace('/upload');
      }, 3000);
    }

    // Demo auto-load (PDF upload path)
    const isDemo = searchParams.get('demo') === 'true';
    if (isDemo) {
      void loadDemoPdf(true);
    }

    return () => {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Load demo PDF manually or auto (?demo=true) ───────────────────────────
  async function loadDemoPdf(autoAnalyze = false) {
    try {
      const res = await fetch('/demo-report.pdf');
      if (!res.ok) throw new Error('fetch failed');
      const blob = await res.blob();
      const demoFile = new File([blob], 'demo-report.pdf', { type: 'application/pdf' });
      setFile(demoFile);
      setText('');
      setError(null);
      if (autoAnalyze) {
        setTimeout(() => {
          void analyzeRef.current?.(undefined, demoFile);
        }, 500);
      }
    } catch {
      setError('Could not load demo report. Please try uploading a file.');
    }
  }

  // ── File handling ─────────────────────────────────────────────────────────
  function handleFileSelect(selected: File | null) {
    if (!selected) return;
    const allowed = ['application/pdf', 'text/plain'];
    if (!allowed.includes(selected.type)) {
      setError('Please upload a PDF or text file.');
      return;
    }
    setFile(selected);
    setText('');
    setError(null);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(true);
  }

  function removeFile() {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const canAnalyze = (!!file || text.trim().length > 0) && !loading;

  // ── Loading overlay ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <style>{`
          @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
          @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        `}</style>
        <div style={{
          position:       'fixed', inset: 0, zIndex: 100,
          background:     'rgba(10,22,40,0.82)',
          backdropFilter: 'blur(6px)',
          display:        'flex', flexDirection: 'column',
          alignItems:     'center', justifyContent: 'center', gap: 20,
          animation:      'fadeIn 0.2s ease-out',
        }}>
          {/* Spinner */}
          <div style={{
            width: 52, height: 52,
            border: '4px solid rgba(0,212,170,0.20)',
            borderTopColor: TEAL,
            borderRadius: '50%',
            animation: 'spin 0.85s linear infinite',
          }} />

          {/* Step text */}
          <p style={{
            fontSize: 18, fontWeight: 600,
            color: TEAL, margin: 0, textAlign: 'center',
            fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
            letterSpacing: '-0.01em',
          }}>
            {loadingStep}
          </p>

          {/* Tier label */}
          <p style={{
            fontSize: 13, color: 'rgba(255,255,255,0.50)',
            margin: 0, fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
          }}>
            Using {tier === 'premium' ? '⭐ Claude AI (Premium)' : 'Free AI'}
          </p>
        </div>
      </>
    );
  }

  // ── Main page ─────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        .upload-zone:hover { border-color: ${TEAL} !important; background: ${TEAL_DIM} !important; }
        .btn-analyze:hover:not(:disabled) { opacity: 0.88; box-shadow: 0 6px 20px rgba(0,212,170,0.35) !important; }
        .btn-analyze:active:not(:disabled) { transform: scale(0.97); }
        .btn-demo:hover { background: ${TEAL_DIM} !important; border-color: ${TEAL} !important; color: ${TEAL_DARK} !important; }
        .remove-btn:hover { color: #b91c1c !important; }
      `}</style>

      <div style={{
        background: BG_TINT, minHeight: '100vh',
        fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
        color: NAVY,
      }}>

        {/* ── Navbar ────────────────────────────────────────────────────── */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${BORDER}`,
          padding: '0 24px', height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none',
          }}>
            <span style={{ fontSize: 16 }}>🩺</span>
            <span style={{ fontWeight: 700, fontSize: 15, color: NAVY }}>
              LabCard<span style={{ color: TEAL }}>AI</span>
            </span>
          </Link>
          <Link href="/pricing" style={{
            fontSize: 13, color: MUTED, textDecoration: 'none', fontWeight: 500,
          }}>
            Pricing
          </Link>
        </nav>

        {/* ── Upgraded banner ───────────────────────────────────────────── */}
        {upgraded && (
          <div style={{
            background: 'rgba(0,212,170,0.10)',
            border: `1px solid ${TEAL_BORDER}`,
            padding: '10px 24px', textAlign: 'center',
            fontSize: 13, color: TEAL_DARK, fontWeight: 600,
          }}>
            ⭐ Premium activated! Your next analysis will use Claude AI.
          </div>
        )}

        {/* ── Page content ──────────────────────────────────────────────── */}
        <div style={{
          maxWidth: 560, margin: '0 auto',
          padding: '32px 20px 60px',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>

          {/* Breadcrumb */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, color: MUTED,
          }}>
            <Link href="/" style={{ color: MUTED, textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <span style={{ color: NAVY, fontWeight: 500 }}>Upload</span>
          </div>

          {/* ── Backend warm-up banner ──────────────────────────────────── */}
        {backendReady === false && (
          <div style={{
            background:   'rgba(245,158,11,0.08)',
            border:       '1px solid rgba(245,158,11,0.25)',
            borderRadius: 10,
            padding:      '10px 16px',
            display:      'flex',
            alignItems:   'center',
            gap:          8,
            fontSize:     13,
            color:        '#92400E',
          }}>
            <span style={{ fontSize: 18 }}>🔄</span>
            <span>
              <strong>AI is warming up...</strong> First analysis may take up to 30 seconds.
              The backend server was sleeping — it&apos;s starting now.
            </span>
          </div>
        )}

        {/* ── Upload card ──────────────────────────────────────────────── */}
          <div style={{
            background: BG,
            border: `1px solid ${BORDER_GRAY}`,
            borderRadius: 16,
            padding: '24px 24px 20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>

            {/* Card header */}
            <div style={{ marginBottom: 20 }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: 4,
              }}>
                <h1 style={{
                  fontSize: 20, fontWeight: 700, color: NAVY,
                  margin: 0, letterSpacing: '-0.02em',
                }}>
                  Upload Lab Report
                </h1>
                {tier === 'premium' ? (
                  <span style={{
                    background: 'linear-gradient(135deg,#FFD700,#FFA500)',
                    color: '#7C5000', borderRadius: 20,
                    padding: '3px 10px', fontSize: 11, fontWeight: 700,
                  }}>⭐ Premium</span>
                ) : (
                  <Link href="/pricing" style={{
                    fontSize: 11, color: MUTED, textDecoration: 'none',
                    background: BORDER_GRAY, borderRadius: 20,
                    padding: '3px 10px', fontWeight: 500,
                  }}>
                    Free tier · Upgrade →
                  </Link>
                )}
              </div>
              <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>
                Thyrocare · Dr. Lal · Apollo · SRL · Any Indian lab
              </p>
            </div>

            {/* ── Drag & drop zone ──────────────────────────────────────── */}
            {file ? (
              // File selected state
              <div style={{
                height: 100,
                border: `2px solid ${TEAL}`,
                borderRadius: 10,
                background: TEAL_DIM,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 10, marginBottom: 16,
              }}>
                <span style={{ fontSize: 22 }}>📄</span>
                <div>
                  <p style={{
                    fontSize: 13, fontWeight: 600, color: TEAL_DARK,
                    margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    <span style={{ color: '#16a34a' }}>✓</span> {file.name}
                  </p>
                  <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  className="remove-btn"
                  onClick={removeFile}
                  style={{
                    background: 'none', border: 'none',
                    color: MUTED, fontSize: 18, cursor: 'pointer',
                    padding: '4px', lineHeight: 1,
                    marginLeft: 4, transition: 'color 0.15s',
                  }}
                  title="Remove file"
                >
                  ✕
                </button>
              </div>
            ) : (
              // Drop zone
              <div
                className="upload-zone"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  height:        160,
                  border:        `2px dashed ${dragOver ? TEAL : TEAL_BORDER}`,
                  borderRadius:  10,
                  background:    dragOver ? TEAL_DIM : BG,
                  display:       'flex',
                  flexDirection: 'column',
                  alignItems:    'center',
                  justifyContent: 'center',
                  gap:           8,
                  cursor:        'pointer',
                  marginBottom:  16,
                  transition:    'all 0.15s',
                }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: TEAL_DIM, border: `1px solid ${TEAL_BORDER}`,
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 22,
                }}>
                  📤
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{
                    fontSize: 14, fontWeight: 600, color: NAVY,
                    margin: '0 0 3px',
                  }}>
                    Drop PDF here or <span style={{ color: TEAL }}>click to browse</span>
                  </p>
                  <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>
                    Supports PDF and .txt files
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,application/pdf,text/plain"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                />
              </div>
            )}

            {/* ── OR separator ──────────────────────────────────────────── */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: 14,
            }}>
              <div style={{ flex: 1, height: 1, background: BORDER_GRAY }} />
              <span style={{ fontSize: 12, color: MUTED, fontWeight: 500 }}>or</span>
              <div style={{ flex: 1, height: 1, background: BORDER_GRAY }} />
            </div>

            {/* ── Textarea ──────────────────────────────────────────────── */}
            <div style={{ marginBottom: 6 }}>
              <textarea
                value={text}
                onChange={(e) => { setText(e.target.value); setFile(null); }}
                placeholder="Paste report text here..."
                rows={5}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  minHeight: 120, resize: 'vertical',
                  padding: '10px 12px',
                  border: `1.5px solid ${BORDER_GRAY}`,
                  borderRadius: 10,
                  fontSize: 12,
                  fontFamily: "'Courier New', Courier, monospace",
                  color: NAVY, background: BG_TINT,
                  lineHeight: 1.6,
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => { e.target.style.borderColor = TEAL; }}
                onBlur={(e)  => { e.target.style.borderColor = BORDER_GRAY; }}
              />
              <p style={{
                fontSize: 11, color: '#94A3B8',
                textAlign: 'right', margin: '3px 0 0',
              }}>
                {text.length.toLocaleString()} characters
              </p>
            </div>

            {/* ── Buttons row ───────────────────────────────────────────── */}
            <div style={{
              display: 'flex', gap: 8, flexWrap: 'wrap',
              marginBottom: error ? 14 : 0,
            }}>
              {/* Demo button */}
              <button
                className="btn-demo"
                onClick={() => void loadDemoPdf()}
                style={{
                  padding: '9px 14px', borderRadius: 9,
                  border: `1.5px solid ${BORDER}`,
                  background: BG, color: MUTED,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
                  whiteSpace: 'nowrap',
                }}
              >
                Load Demo Report
              </button>

              {/* Analyze button */}
              <button
                className="btn-analyze"
                onClick={() => void handleAnalyze()}
                disabled={!canAnalyze}
                style={{
                  flex: 1, padding: '10px 18px',
                  borderRadius: 10, border: 'none',
                  background: canAnalyze ? TEAL : BORDER_GRAY,
                  color: canAnalyze ? '#FFFFFF' : '#94A3B8',
                  fontSize: 14, fontWeight: 700,
                  cursor: canAnalyze ? 'pointer' : 'not-allowed',
                  boxShadow: canAnalyze ? '0 3px 10px rgba(0,212,170,0.28)' : 'none',
                  transition: 'all 0.15s',
                  fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
                  letterSpacing: '-0.01em',
                }}
              >
                Analyse Report →
              </button>
            </div>

            {/* ── Error message ─────────────────────────────────────────── */}
            {error && (
              <div style={{
                background: 'rgba(220,38,38,0.06)',
                border: '1px solid rgba(220,38,38,0.20)',
                borderRadius: 8, padding: '10px 14px',
              }}>
                <p style={{ fontSize: 13, color: '#b91c1c', margin: 0, lineHeight: 1.5 }}>
                  ⚠ {error}
                </p>
              </div>
            )}
          </div>

          {/* ── Privacy notice ─────────────────────────────────────────── */}
          <p style={{
            fontSize: 12, color: '#94A3B8',
            textAlign: 'center', margin: 0, lineHeight: 1.6,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 6,
          }}>
            <span>🔒</span>
            Your report is processed in-memory and never stored on our servers.
          </p>
        </div>
      </div>
    </>
  );
}
