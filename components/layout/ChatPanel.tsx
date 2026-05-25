'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Zap } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { getMockAiResponse } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function ChatPanel() {
  const { chatOpen, setChatOpen, messages, addMessage, t } = useAppStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    addMessage({ role: 'user', content: msg });
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const reply = await getMockAiResponse(msg);
    addMessage({ role: 'assistant', content: reply });
    setLoading(false);
  }

  return (
    <div
      className={cn(
        'fixed top-0 right-0 h-full w-[380px] bg-[#13161f] border-l border-[#2a2f45] flex flex-col z-30 transition-transform duration-300',
        chatOpen ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-[#2a2f45] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#e8eaf0]">{t.chat.title}</p>
            <p className="text-[10px] text-[#5a6280]">{t.chat.subtitle}</p>
          </div>
        </div>
        <button
          onClick={() => setChatOpen(false)}
          className="p-1.5 rounded-md text-[#5a6280] hover:text-[#e8eaf0] hover:bg-[#1e2130] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-600/30 flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-sm text-[#8891aa] mb-1">{t.chat.emptyTitle}</p>
            <p className="text-xs text-[#5a6280]">{t.chat.emptySubtitle}</p>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            {m.role === 'assistant' && (
              <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                <Zap className="w-3 h-3 text-white" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[85%] rounded-xl px-3 py-2.5 text-sm leading-relaxed',
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'bg-[#1e2130] border border-[#2a2f45] text-[#e8eaf0] rounded-tl-sm'
              )}
            >
              {m.content.split('\n').map((line, i) => (
                <p key={i} className={i > 0 ? 'mt-1' : ''}>
                  {line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
                    part.startsWith('**') && part.endsWith('**')
                      ? <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>
                      : part
                  )}
                </p>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <div className="bg-[#1e2130] border border-[#2a2f45] rounded-xl rounded-tl-sm px-3 py-2.5">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#5a6280] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-[#5a6280] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-[#5a6280] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts */}
      <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
        {t.chat.prompts.map((p) => (
          <button
            key={p}
            onClick={() => handleSend(p)}
            className="text-[11px] bg-[#1e2130] border border-[#2a2f45] text-[#8891aa] hover:text-[#e8eaf0] hover:border-[#3a4060] px-2.5 py-1 rounded-full transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 pt-2 border-t border-[#2a2f45] flex-shrink-0">
        <div className="flex gap-2 bg-[#1e2130] border border-[#2a2f45] rounded-xl px-3 py-2 focus-within:border-blue-600/50 transition-colors">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={t.chat.placeholder}
            className="flex-1 bg-transparent text-sm text-[#e8eaf0] placeholder-[#5a6280] outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 w-7 h-7 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
