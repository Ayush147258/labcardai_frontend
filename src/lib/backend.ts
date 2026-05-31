// ─────────────────────────────────────────────────────────────────────────────
// LabCard AI — Backend API Client
// Connects Next.js frontend → FastAPI backend on HF Spaces
// ─────────────────────────────────────────────────────────────────────────────

import type { ChatMessage, LabReport } from '@/lib/types';
import { snakeToCamel } from '@/lib/utils/snake-to-camel';

// HF Spaces URL — set NEXT_PUBLIC_BACKEND_URL in .env.local and Vercel dashboard
export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://YOUR-HF-USERNAME-labcard-backend.hf.space';

// ── Type for backend snake_case response (before conversion) ─────────────────
// The Python backend returns snake_case keys; we convert to camelCase before use
type BackendLabReport = Record<string, unknown>;

function formatBackendError(errBody: { detail?: unknown; error?: string }): string {
  if (typeof errBody.error === 'string' && errBody.error) {
    return errBody.error;
  }
  if (typeof errBody.detail === 'string' && errBody.detail) {
    return errBody.detail;
  }
  if (Array.isArray(errBody.detail)) {
    const messages = errBody.detail
      .map((item) =>
        typeof item === 'object' && item !== null && 'msg' in item
          ? String((item as { msg: string }).msg)
          : null
      )
      .filter(Boolean);
    if (messages.length > 0) {
      return messages.join('; ');
    }
  }
  return 'Analysis failed. Please try again.';
}

// ── Analyze ──────────────────────────────────────────────────────────────────

export async function analyzeWithBackend(
  formData: FormData,
  tier: string
): Promise<LabReport> {
  const controller = new AbortController();
  // 90s timeout — premium Claude analysis can take up to ~8s, plus PDF extraction
  const timeoutId = setTimeout(() => controller.abort(), 90_000);

  try {
    const response = await fetch(`${BACKEND_URL}/api/analyze`, {
      method:  'POST',
      headers: {
        'X-User-Tier': tier,
        // No Content-Type — browser sets multipart boundary automatically
      },
      body:   formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let detail = 'Analysis failed. Please try again.';
      try {
        const errBody = await response.json() as { detail?: unknown; error?: string };
        detail = formatBackendError(errBody);
      } catch {
        if (response.status === 503 || response.status === 502) {
          detail = 'Backend unavailable. Start the Python server on http://localhost:8000.';
        }
      }
      throw new Error(detail);
    }

    const raw = (await response.json()) as BackendLabReport;
    // Python backend → snake_case; frontend expects camelCase
    return snakeToCamel(raw) as LabReport;

  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(
        'Analysis timed out. The AI server may be waking up — please try again in 30 seconds.'
      );
    }
    throw err;
  }
}

// ── Chat ─────────────────────────────────────────────────────────────────────

export async function chatWithBackend(
  messages:   ChatMessage[],
  reportData: string,
  lang:       'en' | 'hi',
  tier:       string
): Promise<string> {
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        report_data: reportData,  // backend expects snake_case
        lang,
        tier,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Chat request failed. Please try again.');
    }

    const data = (await response.json()) as { reply?: string };
    return data.reply ?? '';

  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(
        lang === 'hi'
          ? 'अभी कनेक्शन में समस्या है। कृपया थोड़ी देर बाद पुनः प्रयास करें।'
          : 'Request timed out. Please try again in a moment.'
      );
    }
    throw err;
  }
}

// ── Health / warm-up ping ─────────────────────────────────────────────────────

export interface BackendHealth {
  status:         string;
  is_warm:        boolean;
  uptime_seconds: number;
  version:        string;
}

export async function pingBackend(timeoutMs = 5000): Promise<BackendHealth | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) return null;
    return (await response.json()) as BackendHealth;
  } catch {
    return null;
  }
}
