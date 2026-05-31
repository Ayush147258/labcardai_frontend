// ─────────────────────────────────────────────────────────────────────────────
// LabCard AI — /api/analyze (Next.js proxy → Python backend on HF Spaces)
// Keeps backend URL server-side only — never exposed to browser.
// All AI logic lives in the Python backend now.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { analyzeWithBackend } from '@/lib/backend';
import type { UserTier } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 90s max — HF Spaces cold start + PDF + AI can take up to 30s
export const maxDuration = 90;

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // ── 1. Read tier from header ──────────────────────────────────────────
    const tierHeader = req.headers.get('x-user-tier');
    const tier: UserTier = tierHeader === 'premium' ? 'premium' : 'free';

    // ── 2. Parse incoming FormData ────────────────────────────────────────
    let incomingForm: FormData;
    try {
      incomingForm = await req.formData();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request — expected multipart/form-data.' },
        { status: 400 }
      );
    }

    const file = incomingForm.get('file') as File | null;
    const text = incomingForm.get('text') as string | null;
    const lang = (incomingForm.get('lang') as string | null) ?? 'en';

    if (!file && !text) {
      return NextResponse.json(
        { error: 'Either a PDF file or report text is required.' },
        { status: 400 }
      );
    }

    // ── 3. Build FormData for Python backend ──────────────────────────────
    // Re-build FormData — can't forward the original directly in Node.js
    const backendForm = new FormData();
    if (file) {
      backendForm.append('file', file);
    } else if (text) {
      backendForm.append('text', text);
    }
    backendForm.append('lang', lang);
    backendForm.append('tier', tier);

    // ── 4. Call Python backend ────────────────────────────────────────────
    const result = await analyzeWithBackend(backendForm, tier);

    return NextResponse.json(result);

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[proxy/analyze] Error:', msg);

    const isTimeout = msg.includes('timed out') || msg.includes('AbortError');
    return NextResponse.json(
      {
        error: isTimeout
          ? 'Analysis timed out. The AI server may be warming up — please try again in 30 seconds.'
          : msg || 'Analysis failed. Please try again.',
      },
      { status: isTimeout ? 504 : 500 }
    );
  }
}
