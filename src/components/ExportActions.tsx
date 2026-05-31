'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LabReport } from '@/lib/types';
import { countByHealthTier, getHealthStatusTier, HEALTH_STATUS_LABELS } from '@/lib/health-status';

interface ExportActionsProps {
  report: LabReport;
  lang:   'en' | 'hi';
}

const TEAL = '#00D4AA';
const NAVY = '#0A1628';
const BORDER = '#E8F5F2';
const MUTED = '#64748B';

function formatPdfDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function buildWhatsAppSummary(report: LabReport, lang: 'en' | 'hi'): string {
  const counts = countByHealthTier(report.biomarkers);
  const actionItems = report.biomarkers.filter((b) => getHealthStatusTier(b.status) === 'action_required');
  const attentionItems = report.biomarkers.filter((b) => getHealthStatusTier(b.status) === 'needs_attention');

  const lines = [
    'LabCard AI Health Summary',
    '',
    `Health Score: ${report.healthScore}/100 (${report.healthGrade})`,
    '',
    `🟢 ${HEALTH_STATUS_LABELS.optimal}: ${counts.optimal}`,
    `🟡 ${HEALTH_STATUS_LABELS.needs_attention}: ${counts.needs_attention}`,
    `🔴 ${HEALTH_STATUS_LABELS.action_required}: ${counts.action_required}`,
    '',
  ];

  if (actionItems.length > 0) {
    lines.push('Action Required:');
    actionItems.slice(0, 8).forEach((b) => lines.push(`• ${b.name} ${b.status} (${b.value} ${b.unit})`));
    lines.push('');
  }

  if (attentionItems.length > 0) {
    lines.push('Needs Attention:');
    attentionItems.slice(0, 8).forEach((b) => lines.push(`• ${b.name} ${b.status} (${b.value} ${b.unit})`));
    lines.push('');
  }

  if (report.topPriority) {
    lines.push('Recommendations:');
    lines.push(`• ${report.topPriority}`);
  }

  const summary = lang === 'hi' ? report.summaryHindi : report.summary;
  if (summary) {
    lines.push(`• ${summary.split('.')[0]}`);
  }

  lines.push('• Consult a qualified physician for medical decisions');
  lines.push('');
  lines.push('— LabCard AI · labcardai.vercel.app');

  return lines.join('\n');
}

async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}

export default function ExportActions({ report, lang }: ExportActionsProps): React.ReactElement {
  const router = useRouter();
  const [waStatus, setWaStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  async function handleWhatsApp() {
    setWaStatus('idle');
    const message = buildWhatsAppSummary(report, lang);

    try {
      await copyToClipboard(message);
      const shareUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
      setWaStatus('success');
      setTimeout(() => setWaStatus('idle'), 4000);
    } catch (err: unknown) {
      console.error('[ExportActions] WhatsApp share failed:', err);
      setWaStatus('error');
      setTimeout(() => setWaStatus('idle'), 4000);
    }
  }

  async function handlePDF() {
    setPdfLoading(true);
    setPdfError(null);

    const el = document.getElementById('labcard-report-export');
    if (!el) {
      setPdfError('Unable to generate PDF.\nPlease try again.');
      setPdfLoading(false);
      return;
    }

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(el, {
        scale:       2,
        useCORS:     true,
        logging:     false,
        backgroundColor: '#F8FFFE',
        windowWidth: el.scrollWidth,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pageWidth = 210;
      const pageHeight = 297;
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`LabCard_Report_${formatPdfDate()}.pdf`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[ExportActions] PDF generation failed:', msg);
      setPdfError('Unable to generate PDF.\nPlease try again.');
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <>
      <style>{`
        .export-btn { transition: opacity 0.15s, transform 0.1s; }
        .export-btn:hover:not(:disabled) { opacity: 0.88; }
        .export-btn:active:not(:disabled) { transform: scale(0.97); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{
        display: 'flex', gap: 10, flexWrap: 'wrap',
        fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
      }}>
        <button
          type="button"
          className="export-btn"
          onClick={() => void handleWhatsApp()}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '10px 18px', borderRadius: 10, border: 'none',
            background: waStatus === 'success' ? '#16A34A' : '#25D366',
            color: '#FFFFFF', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(37,211,102,0.28)', minWidth: 160,
            justifyContent: 'center',
          }}
        >
          {waStatus === 'success' ? '✓ Summary copied!' : '📲 Share on WhatsApp'}
        </button>

        <button
          type="button"
          className="export-btn"
          onClick={() => void handlePDF()}
          disabled={pdfLoading}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '10px 18px', borderRadius: 10, border: 'none',
            background: pdfError ? '#94A3B8' : '#3B82F6',
            color: '#FFFFFF', fontSize: 13, fontWeight: 600,
            cursor: pdfLoading ? 'not-allowed' : 'pointer',
            opacity: pdfLoading ? 0.85 : 1,
            minWidth: 150, justifyContent: 'center',
          }}
        >
          {pdfLoading ? (
            <>
              <span style={{
                width: 13, height: 13,
                border: '2px solid rgba(255,255,255,0.35)',
                borderTopColor: '#FFF', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite', display: 'inline-block',
              }} />
              Generating PDF...
            </>
          ) : '⬇ Save as PDF'}
        </button>

        <button
          type="button"
          className="export-btn"
          onClick={() => router.push('/upload')}
          style={{
            padding: '10px 18px', borderRadius: 10,
            border: `1.5px solid ${BORDER}`, background: '#FFFFFF',
            color: NAVY, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          ↺ Analyse Another
        </button>
      </div>

      {waStatus === 'success' && (
        <p style={{ fontSize: 12, color: '#15803d', margin: '10px 0 0', fontWeight: 500 }}>
          Summary copied and ready to share.
        </p>
      )}
      {waStatus === 'error' && (
        <p style={{ fontSize: 12, color: '#b91c1c', margin: '10px 0 0' }}>
          Could not open WhatsApp. Summary may still be in your clipboard.
        </p>
      )}
      {pdfError && (
        <p style={{ fontSize: 12, color: '#b91c1c', margin: '10px 0 0', whiteSpace: 'pre-wrap' }}>
          {pdfError}
        </p>
      )}

      <p style={{ fontSize: 11, color: MUTED, margin: '8px 0 0' }}>
        <span style={{
          background: 'rgba(0,212,170,0.08)', border: `1px solid rgba(0,212,170,0.20)`,
          borderRadius: 20, padding: '2px 8px', fontSize: 10, color: TEAL, fontWeight: 600,
        }}>Tip</span>
        {' '}PDF captures your report exactly as shown on screen, including status colors.
      </p>
    </>
  );
}
