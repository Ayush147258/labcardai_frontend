// ─────────────────────────────────────────────────────────────────────────────
// LabCard AI — AI Router with Free / Premium tier support
//
// ROUTING:
//   premium → Claude Sonnet 4 (claude-sonnet-4-20250514)
//             fallback → gemini-2.5-flash (free)
//
//   free    → gemini-2.5-flash  (primary free)
//             fallback → Groq llama-3.3-70b-versatile (secondary free)
//
// Model refs (verified May 2026):
//   Claude:  claude-sonnet-4-20250514
//   Gemini:  gemini-2.5-flash   ← stable, replaces deprecated 2.0-flash
//   Groq:    llama-3.3-70b-versatile (free 14,400 req/day)
// ─────────────────────────────────────────────────────────────────────────────

export type AIMessage = {
  role: string;
  content: string;
};

type GeminiPart = { text: string };
type GeminiCandidate = { content: { parts: GeminiPart[] } };
type GeminiResponse = { candidates?: GeminiCandidate[] };

type AnthropicContent = { type: string; text?: string };
type AnthropicResponse = { content?: AnthropicContent[] };

type GroqChoice = { message: { content: string } };
type GroqResponse = { choices?: GroqChoice[] };

// ─── Provider: Claude (Anthropic) ────────────────────────────────────────────
async function callClaude(
  messages: AIMessage[],
  system: string,
  maxTokens: number
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as AnthropicResponse;
  const text = data.content?.find((c) => c.type === 'text')?.text;
  if (!text) throw new Error('Claude returned empty content');
  return text;
}

// ─── Provider: Gemini 2.5 Flash (Google) — FREE ──────────────────────────────
// Stable model string: gemini-2.5-flash (GA as of May 2026)
// Free tier: 15 RPM / 1 million tokens per day via AI Studio key
async function callGemini(
  messages: AIMessage[],
  system: string,
  maxTokens: number
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  // Combine system + messages into a single prompt for Gemini
  const combinedPrompt = [
    system,
    '',
    ...messages.map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`),
  ].join('\n');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: combinedPrompt }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.3,   // lower temp = more deterministic JSON output
          topP: 0.8,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned empty content');
  return text;
}

// ─── Provider: Groq — FREE fallback ──────────────────────────────────────────
// Free: 14,400 req/day, 6,000 req/min at 6,000 tokens/min
async function callGroq(
  messages: AIMessage[],
  system: string,
  maxTokens: number
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: maxTokens,
      temperature: 0.3,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as GroqResponse;
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Groq returned empty content');
  return text;
}

// ─── Main Router ─────────────────────────────────────────────────────────────
export async function callAI(
  messages: AIMessage[],
  system: string,
  tier: 'free' | 'premium' = 'free',
  maxTokens = 1500
): Promise<string> {

  // ── PREMIUM PATH ──────────────────────────────────────────────────────────
  // Claude first → Gemini fallback (so premium users never get errors)
  if (tier === 'premium') {
    try {
      console.log('[AI Router] Premium tier → trying Claude Sonnet...');
      const result = await callClaude(messages, system, maxTokens);
      console.log('[AI Router] ✓ Claude succeeded');
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[AI Router] Claude failed, falling back to Gemini:', msg);
      // Fall through to free tier providers
    }
  }

  // ── FREE PATH (also premium fallback) ────────────────────────────────────
  // Gemini 2.5 Flash first → Groq fallback
  try {
    console.log('[AI Router] Free tier → trying Gemini 2.5 Flash...');
    const result = await callGemini(messages, system, maxTokens);
    console.log('[AI Router] ✓ Gemini succeeded');
    return result;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[AI Router] Gemini failed, trying Groq:', msg);
  }

  try {
    console.log('[AI Router] Trying Groq llama-3.3-70b...');
    const result = await callGroq(messages, system, maxTokens);
    console.log('[AI Router] ✓ Groq succeeded');
    return result;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[AI Router] Groq also failed:', msg);
  }

  // All providers exhausted
  throw new Error(
    'All AI providers failed. Please check your API keys or try again in a few minutes.'
  );
}
