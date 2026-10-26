import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, RefreshCw, Trash2, Maximize2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const QUICK_QUESTIONS = [
  'How does inflation affect my savings?',
  'My education goal costs ₹5,00,000 today. How much will it cost in 5 years at 6% inflation?',
  'Explain inflation in simple words.',
  'How can I plan my monthly expenses?',
];

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hi there! I am your **InflationWise AI Assistant**.\nAsk me to calculate future goal costs, explain inflation, or help with your budget.',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const endRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = async (customText) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || loading) return;

    const userMsg = { role: 'user', text: textToSend, timestamp: Date.now() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await API.post('/chatbot/message', {
        message: textToSend,
        history: updated.slice(-6),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res.data.reply || 'I could not generate a response.',
          timestamp: Date.now(),
        },
      ]);
    } catch (err) {
      setError('AI assistant is momentarily unavailable. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2 rounded-full bg-gradient-to-r from-[#20205A] to-[#3155C6] px-4 py-3 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
          aria-label="Open InflationWise AI Assistant"
        >
          <div className="relative">
            <Bot size={22} className="text-[#16C7D9]" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16C7D9] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#16C7D9]"></span>
            </span>
          </div>
          <span className="text-sm font-semibold tracking-wide">AI Assistant</span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="flex flex-col w-[360px] sm:w-[420px] h-[550px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-[#20205A] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-[#3155C6] flex items-center justify-center text-[#16C7D9]">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">InflationWise AI Assistant</h3>
                <p className="text-[11px] text-[#16C7D9] flex items-center gap-1">
                  <Sparkles size={11} /> Smart Financial Companion
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/assistant');
                }}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition"
                title="Expand to Full Page"
              >
                <Maximize2 size={15} />
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Reset conversation?')) {
                    setMessages([
                      {
                        role: 'assistant',
                        text: 'Conversation reset. How can I assist you with your financial planning?',
                        timestamp: Date.now(),
                      },
                    ]);
                  }
                }}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition"
                title="Clear Chat"
              >
                <Trash2 size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition"
                title="Close"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC]">
            {messages.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex gap-2 max-w-[85%] ${
                    isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${
                      isUser ? 'bg-[#3155C6] text-white' : 'bg-[#20205A] text-[#16C7D9]'
                    }`}
                  >
                    {isUser ? 'You' : <Bot size={13} />}
                  </div>
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-xs shadow-xs ${
                      isUser
                        ? 'bg-[#3155C6] text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none whitespace-pre-line'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200 w-fit">
                <RefreshCw size={13} className="animate-spin text-[#16C7D9]" />
                <span>Assistant is typing...</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_QUESTIONS.map((q, i) => (
              <button
                key={i}
                disabled={loading}
                onClick={() => sendMessage(q)}
                className="text-[11px] whitespace-nowrap bg-slate-50 hover:bg-[#DDF8FB] hover:text-[#0891B2] text-slate-600 px-2.5 py-1 rounded-full border border-slate-200 transition"
              >
                {q.length > 30 ? q.slice(0, 30) + '...' : q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-300 focus-within:border-[#3155C6] px-3 py-1.5"
            >
              <input
                type="text"
                disabled={loading}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask InflationWise AI..."
                className="flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="h-7 w-7 rounded-lg bg-[#3155C6] text-white flex items-center justify-center hover:bg-[#2542A8] disabled:opacity-40 transition flex-shrink-0"
              >
                <Send size={13} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
