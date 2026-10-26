import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Trash2, Sparkles, RefreshCw, AlertCircle, Calculator } from 'lucide-react';
import API from '../services/api';

const SUGGESTED_QUESTIONS = [
  'How does inflation affect my savings?',
  'How much will my education goal cost in five years?',
  'Explain inflation in simple words.',
  'How can I plan my monthly expenses?',
  'How do I calculate the future cost of a financial goal?',
];

const INITIAL_MESSAGE = {
  role: 'assistant',
  text: 'Hello! I am your **InflationWise AI Assistant**.\n\n*Your Smart Companion for Inflation-Based Financial Planning.*\n\nI can help you forecast inflation-adjusted goals, optimize your monthly budget, understand compound inflation, or answer questions about your financial plans. How can I help you today?',
  timestamp: Date.now(),
};

export default function Assistant() {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('inflationwise_chat_history');
      return saved ? JSON.parse(saved) : [INITIAL_MESSAGE];
    } catch {
      return [INITIAL_MESSAGE];
    }
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem('inflationwise_chat_history', JSON.stringify(messages));
    } catch {
      /* ignore storage errors */
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (overrideText) => {
    const textToSend = (overrideText || input).trim();
    if (!textToSend || loading) return;

    const userMsg = { role: 'user', text: textToSend, timestamp: Date.now() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await API.post('/chatbot/message', {
        message: textToSend,
        history: updatedMessages.slice(-8),
      });

      const reply = response.data.reply || 'I could not generate a response.';
      const botMsg = {
        role: 'assistant',
        text: reply,
        calculation: response.data.calculation,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setError(
        err.response?.data?.message ||
        'InflationWise AI Assistant is temporarily unavailable. Please try again.'
      );
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    if (window.confirm('Clear all conversation history?')) {
      setMessages([INITIAL_MESSAGE]);
      setError(null);
      localStorage.removeItem('inflationwise_chat_history');
    }
  };

  // Helper to format simple markdown lines into HTML elements
  const renderMessageContent = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="font-bold text-base text-[#10233F] mt-2 mb-1">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('#### ')) {
        return <h4 key={idx} className="font-semibold text-sm text-[#10233F] mt-2 mb-1">{line.replace('#### ', '')}</h4>;
      }
      if (line.startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-sm my-0.5">
            {line.replace('- ', '')}
          </li>
        );
      }
      if (line.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-4 border-[#16C7D9] pl-3 py-1 my-2 text-xs bg-slate-50 text-slate-700 rounded-r">
            {line.replace('> ', '')}
          </blockquote>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      return <p key={idx} className="text-sm my-1 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-[#20205A] to-[#3155C6] flex items-center justify-center text-[#16C7D9] shadow-sm">
            <Bot size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#10233F] font-display">
                InflationWise AI Assistant
              </h1>
              <span className="flex items-center gap-1 text-[11px] font-medium bg-[#DDF8FB] text-[#0891B2] px-2 py-0.5 rounded-full">
                <Sparkles size={12} /> AI Powered
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Your Smart Companion for Inflation-Based Financial Planning
            </p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
          title="Clear Conversation"
        >
          <Trash2 size={14} /> Clear Chat
        </button>
      </div>

      {/* Suggested Questions */}
      <div className="py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-xs font-semibold text-slate-400 whitespace-nowrap flex items-center gap-1">
          <Sparkles size={13} className="text-[#16C7D9]" /> Suggested:
        </span>
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            disabled={loading}
            onClick={() => sendMessage(q)}
            className="text-xs whitespace-nowrap bg-white border border-slate-200 hover:border-[#16C7D9] hover:text-[#3155C6] text-slate-600 px-3 py-1.5 rounded-full transition shadow-sm hover:shadow"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto px-1 py-4 space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs ${
                  isUser ? 'bg-[#3155C6]' : 'bg-[#20205A]'
                }`}
              >
                {isUser ? <User size={16} /> : <Bot size={16} className="text-[#16C7D9]" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-2xl px-4 py-3 shadow-sm ${
                  isUser
                    ? 'bg-[#3155C6] text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-[#1E293B] rounded-tl-none'
                }`}
              >
                <div className="leading-relaxed">
                  {isUser ? (
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    renderMessageContent(msg.text)
                  )}
                </div>

                <div
                  className={`mt-1.5 text-[10px] text-right ${
                    isUser ? 'text-white/70' : 'text-slate-400'
                  }`}
                >
                  {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-md mr-auto animate-fade">
            <div className="h-8 w-8 rounded-full bg-[#20205A] text-[#16C7D9] flex items-center justify-center flex-shrink-0">
              <Bot size={16} />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2 text-xs text-slate-500">
              <RefreshCw size={14} className="animate-spin text-[#16C7D9]" />
              <span>InflationWise AI Assistant is calculating...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 text-xs bg-red-50 text-red-600 rounded-xl border border-red-200">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="pt-3 border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="relative flex items-end gap-2 bg-white rounded-xl border border-slate-300 focus-within:border-[#3155C6] p-2 shadow-sm"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            disabled={loading}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about inflation, goals, budgeting, or future cost calculations..."
            className="flex-1 max-h-32 resize-none bg-transparent px-2 py-1 text-sm outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3155C6] text-white hover:bg-[#2542A8] disabled:opacity-40 disabled:cursor-not-allowed transition flex-shrink-0 shadow-sm"
            title="Send Message"
          >
            <Send size={16} />
          </button>
        </form>
        <p className="mt-1.5 text-center text-[11px] text-slate-400">
          Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for a new line. Calculations are educational estimates.
        </p>
      </div>
    </div>
  );
}

