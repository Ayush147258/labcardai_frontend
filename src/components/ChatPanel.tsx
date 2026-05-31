'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { messagesForApi, sendChatMessage } from '@/lib/chat-api';
import type { ChatMessage } from '@/lib/types';

interface ChatPanelProps {
  reportData:     string;
  initialSummary: string;
  lang:           'en' | 'hi';
  onLangChange:   (lang: 'en' | 'hi') => void;
  tier:           'free' | 'premium';
}

const QUICK_PROMPTS = {
  en: [
    'Why is this value low?',
    'What should I eat?',
    'Is this serious?',
  ],
  hi: [
    'यह कम क्यों है?',
    'क्या खाना चाहिए?',
    'क्या यह गंभीर है?',
  ],
};

const ERROR_MSG = {
  en: 'Unable to generate a response.\nPlease try again.',
  hi: 'प्रतिक्रिया नहीं बना सके।\nकृपया पुनः प्रयास करें।',
};

const UNAVAILABLE_MSG = {
  en: 'AI assistant unavailable.\nPlease retry.',
  hi: 'AI सहायक उपलब्ध नहीं है।\nकृपया पुनः प्रयास करें।',
};

function buildGreeting(lang: 'en' | 'hi', summary: string): string {
  if (lang === 'hi') {
    return `नमस्ते! 🙏 मैं आपका LabCard AI सहायक हूँ। आपकी रिपोर्ट का विश्लेषण हो गया है। आपकी मुख्य प्राथमिकता: ${summary}। कोई भी सवाल पूछें!`;
  }
  return `Hi! 👋 I'm your LabCard AI assistant. I've analysed your report. Your top priority: ${summary}. Ask me anything about your results!`;
}

export default function ChatPanel({
  reportData,
  initialSummary,
  lang,
  onLangChange,
  tier,
}: ChatPanelProps): React.ReactElement {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [lastFailedUserMsg, setLastFailedUserMsg] = useState<string | null>(null);
  const [retryConversation, setRetryConversation] = useState<ChatMessage[] | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages([{ role: 'assistant', content: buildGreeting(lang, initialSummary) }]);
    setLastFailedUserMsg(null);
    setRetryConversation(null);
  }, [lang, initialSummary]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const requestReply = useCallback(async (
    conversation: ChatMessage[],
    userContent: string
  ): Promise<void> => {
    setLoading(true);
    setLastFailedUserMsg(null);

    try {
      const apiMessages = messagesForApi(conversation);
      const reply = await sendChatMessage(apiMessages, reportData, lang, tier);

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: reply },
      ]);
    } catch (err: unknown) {
      const detail = err instanceof Error ? err.message : '';
      console.error('[ChatPanel] chat error:', detail);
      setLastFailedUserMsg(userContent);
      setRetryConversation(conversation);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: detail.includes('unavailable') || detail.includes('failed')
            ? UNAVAILABLE_MSG[lang]
            : ERROR_MSG[lang],
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [reportData, lang, tier]);

  async function handleSend(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: ChatMessage = { role: 'user', content };
    const conversationWithUser = [...messages, userMsg];

    setMessages(conversationWithUser);
    setInput('');
    if (text) inputRef.current?.blur();

    await requestReply(conversationWithUser, content);
  }

  function handleRetry() {
    if (!lastFailedUserMsg || !retryConversation || loading) return;
    setMessages((prev) => {
      const trimmed = [...prev];
      if (trimmed[trimmed.length - 1]?.role === 'assistant') trimmed.pop();
      return trimmed;
    });
    void requestReply(retryConversation, lastFailedUserMsg);
  }

  function handleQuickPrompt(prompt: string) {
    setInput(prompt);
    void handleSend(prompt);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  const TEAL = '#00D4AA';
  const TEAL_DARK = '#00B896';
  const TEAL_DIM = 'rgba(0,212,170,0.08)';
  const TEAL_BORDER = 'rgba(0,212,170,0.20)';
  const NAVY = '#0A1628';
  const MUTED = '#64748B';
  const BG = '#FFFFFF';
  const BG_TINT = '#F8FFFE';
  const BORDER = '#E8F5F2';
  const BORDER_GRAY = '#F1F5F9';

  return (
    <>
      <style>{`
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        .td1 { animation: typing-bounce 1.2s ease-in-out infinite; }
        .td2 { animation: typing-bounce 1.2s ease-in-out 0.15s infinite; }
        .td3 { animation: typing-bounce 1.2s ease-in-out 0.30s infinite; }
        .chat-input:focus { outline: none; border-color: ${TEAL} !important; box-shadow: 0 0 0 3px rgba(0,212,170,0.12); }
        .quick-btn:hover { background: rgba(0,212,170,0.12) !important; border-color: ${TEAL} !important; color: ${TEAL_DARK} !important; }
      `}</style>

      <div style={{
        background: BG, border: `1px solid ${BORDER}`, borderRadius: 16,
        overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
      }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', background: BG_TINT, borderBottom: `1px solid ${BORDER}`,
            cursor: 'pointer',
          }}
          onClick={() => setCollapsed((c) => !c)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>💬 AI Health Chat</span>
            {tier === 'premium' && (
              <span style={{
                background: 'linear-gradient(135deg,#FFD700,#FFA500)',
                color: '#7C5000', borderRadius: 20, padding: '2px 7px',
                fontSize: 10, fontWeight: 700,
              }}>⭐ Premium</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', background: BORDER_GRAY, borderRadius: 8, padding: 2, gap: 2 }}>
              {(['en', 'hi'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => onLangChange(l)}
                  style={{
                    padding: '4px 10px', borderRadius: 6, border: 'none',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    background: lang === l ? TEAL : 'transparent',
                    color: lang === l ? '#FFFFFF' : MUTED,
                    fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
                  }}
                >
                  {l === 'en' ? 'EN' : 'हिं'}
                </button>
              ))}
            </div>
            <span style={{ color: MUTED, fontSize: 12, transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}>▲</span>
          </div>
        </div>

        {!collapsed && (
          <div>
            <div
              ref={scrollRef}
              style={{
                height: 280, overflowY: 'auto', padding: '14px 14px 8px',
                display: 'flex', flexDirection: 'column', gap: 10, background: BG,
              }}
            >
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '82%', padding: '9px 12px',
                    borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: msg.role === 'user' ? TEAL_DIM : BG_TINT,
                    border: `1px solid ${msg.role === 'user' ? TEAL_BORDER : BORDER_GRAY}`,
                    borderLeft: msg.role === 'assistant' ? `3px solid ${TEAL}` : undefined,
                    fontSize: 13, color: NAVY, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{
                    padding: '10px 14px', borderRadius: '12px 12px 12px 2px',
                    background: BG_TINT, border: `1px solid ${BORDER_GRAY}`,
                    borderLeft: `3px solid ${TEAL}`,
                    fontSize: 12, color: MUTED, display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{ display: 'flex', gap: 4 }}>
                      {['td1', 'td2', 'td3'].map((cls) => (
                        <span key={cls} className={cls} style={{
                          width: 6, height: 6, borderRadius: '50%', background: TEAL, display: 'inline-block',
                        }} />
                      ))}
                    </span>
                    {lang === 'hi' ? 'AI आपकी रिपोर्ट का विश्लेषण कर रहा है...' : 'AI is analyzing your report...'}
                  </div>
                </div>
              )}
            </div>

            {lastFailedUserMsg && !loading && (
              <div style={{ padding: '8px 14px', borderTop: `1px solid ${BORDER}`, background: 'rgba(220,38,38,0.04)' }}>
                <button
                  type="button"
                  onClick={() => void handleRetry()}
                  style={{
                    padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(220,38,38,0.25)',
                    background: '#FFFFFF', color: '#b91c1c', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
                  }}
                >
                  ↻ {lang === 'hi' ? 'पुनः प्रयास करें' : 'Retry'}
                </button>
              </div>
            )}

            <div style={{
              padding: '8px 14px', display: 'flex', gap: 6, flexWrap: 'wrap',
              borderTop: `1px solid ${BORDER}`, background: BG_TINT,
            }}>
              {QUICK_PROMPTS[lang].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="quick-btn"
                  onClick={() => handleQuickPrompt(prompt)}
                  disabled={loading}
                  style={{
                    background: 'transparent', border: `1px solid ${BORDER}`,
                    borderRadius: 20, padding: '4px 11px', fontSize: 12, fontWeight: 500,
                    color: MUTED, cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1,
                    fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div style={{
              padding: '10px 12px', display: 'flex', gap: 8,
              borderTop: `1px solid ${BORDER}`, background: BG,
            }}>
              <input
                ref={inputRef}
                className="chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                placeholder={lang === 'hi' ? 'अपना सवाल लिखें...' : 'Ask about your report...'}
                style={{
                  flex: 1, padding: '9px 12px', borderRadius: 10,
                  border: `1.5px solid ${BORDER}`, fontSize: 13, color: NAVY,
                  background: BG_TINT, fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
                }}
              />
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={loading || !input.trim()}
                style={{
                  padding: '9px 16px', borderRadius: 10, border: 'none',
                  background: (!loading && input.trim()) ? TEAL : BORDER_GRAY,
                  color: (!loading && input.trim()) ? '#FFFFFF' : '#94A3B8',
                  fontSize: 13, fontWeight: 600,
                  cursor: (!loading && input.trim()) ? 'pointer' : 'not-allowed',
                  fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif",
                }}
              >
                Send →
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
