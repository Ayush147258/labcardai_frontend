// ─────────────────────────────────────────────────────────────────────────────
// LabCard AI — /api/chat (Next.js proxy → Python backend on HF Spaces)
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { chatWithBackend } from '@/lib/backend';
import type { ChatMessage, UserTier } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface ChatRequestBody {
  messages:    ChatMessage[];
  reportData:  string;
  lang:        'en' | 'hi';
  tier:        UserTier;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // ── Parse body ──────────────────────────────────────────────────────────
    let body: Partial<ChatRequestBody>;
    try {
      body = (await req.json()) as Partial<ChatRequestBody>;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const { messages, reportData, lang = 'en', tier = 'free' } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'messages array is required.' },
        { status: 400 }
      );
    }
    if (!reportData || typeof reportData !== 'string') {
      return NextResponse.json(
        { error: 'reportData is required.' },
        { status: 400 }
      );
    }

    const validLang: 'en' | 'hi' = lang === 'hi' ? 'hi' : 'en';
    const validTier: UserTier    = tier === 'premium' ? 'premium' : 'free';

    // ── Proxy to Python backend ─────────────────────────────────────────────
    const reply = await chatWithBackend(messages, reportData, validLang, validTier);

    return NextResponse.json({ reply: reply.trim() });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[proxy/chat] Error:', msg);
    return NextResponse.json(
      { error: 'Chat failed. Please try again.' },
      { status: 500 }
    );
  }
}
