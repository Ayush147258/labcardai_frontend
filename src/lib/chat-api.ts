// Client-side chat — proxies through Next.js /api/chat (avoids CORS + exposes keys)

import type { ChatMessage } from '@/lib/types';

export async function sendChatMessage(
  messages: ChatMessage[],
  reportData: string,
  lang: 'en' | 'hi',
  tier: 'free' | 'premium'
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60_000);

  try {
    const response = await fetch('/api/chat', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, reportData, lang, tier }),
      signal:  controller.signal,
    });

    clearTimeout(timeoutId);

    const data = (await response.json()) as { reply?: string; error?: string };

    if (!response.ok) {
      throw new Error(data.error || 'Chat request failed. Please try again.');
    }

    const reply = data.reply?.trim();
    if (!reply) {
      throw new Error('Empty response from AI. Please try again.');
    }

    return reply;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw err;
  }
}

/** Exclude UI-only greeting from API payload */
export function messagesForApi(messages: ChatMessage[]): ChatMessage[] {
  if (messages.length === 0) return [];
  const [first, ...rest] = messages;
  if (first.role === 'assistant' && rest.length > 0) {
    return rest;
  }
  if (first.role === 'assistant' && rest.length === 0) {
    return [];
  }
  return messages;
}
