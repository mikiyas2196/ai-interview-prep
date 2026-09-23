'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Brain, User as UserIcon, Sparkles, MessageSquare, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

import { api } from '@/services/api';

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface AIChatPanelProps {
  category?: string;
  questionContext?: string;
}

export const AIChatPanel: React.FC<AIChatPanelProps> = ({
  category = 'Technical',
  questionContext,
}) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am your AI Interview Coach. Feel free to ask me for hints, clarification, or structural tips (e.g. STAR formatting) anytime during your mock interview!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const promptText = input;
    setInput('');
    setIsTyping(true);

    try {
      const res = await api.post('/interviews/chat', {
        message: promptText,
        category,
        question_context: questionContext,
      });

      const aiReply = res.data.reply || `Great question! For ${category} questions, structure your answer using STAR: Situation, Task, Action, Result.`;

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: aiReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error('AI Chat Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `💡 Coaching Tip: Structure your response into: 1. Situation context, 2. Task goal, 3. Action you personally took, and 4. Result/Impact achieved.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[480px] shadow-xl overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
              Live AI Interview Chat
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] px-1.5 py-0.5 rounded font-mono">
                ONLINE
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">Ask for hints, advice, or question clarifications</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setInput('Can you give me a hint for this question?');
          }}
          className="text-[10px] bg-slate-800 hover:bg-slate-700 text-indigo-300 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1 transition-colors"
        >
          <HelpCircle className="w-3 h-3" />
          <span>Ask Hint</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2 ${
              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                msg.sender === 'ai'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-200 border border-slate-700'
              }`}
            >
              {msg.sender === 'ai' ? <Brain className="w-3.5 h-3.5" /> : <UserIcon className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`p-3 rounded-2xl max-w-[80%] space-y-1 ${
                msg.sender === 'ai'
                  ? 'bg-slate-950 border border-slate-800 text-slate-200'
                  : 'bg-indigo-600 text-white shadow-md'
              }`}
            >
              <p className="leading-relaxed font-sans">{msg.text}</p>
              <span className={`block text-[9px] ${msg.sender === 'ai' ? 'text-slate-500' : 'text-indigo-200'} text-right`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <div className="w-7 h-7 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Brain className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-[11px] italic flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-indigo-400 animate-spin" />
              <span>AI Coach is thinking...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI Coach a question or request a hint..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white p-2 rounded-xl transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
