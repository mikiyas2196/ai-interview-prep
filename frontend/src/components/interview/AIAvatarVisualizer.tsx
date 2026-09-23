'use client';

import React from 'react';
import { Brain, Sparkles, Volume2, Mic, Activity } from 'lucide-react';

export type AIAvatarState = 'idle' | 'speaking' | 'listening' | 'evaluating';

interface AIAvatarVisualizerProps {
  state?: AIAvatarState;
  interviewerName?: string;
  subtitle?: string;
}

export const AIAvatarVisualizer: React.FC<AIAvatarVisualizerProps> = ({
  state = 'idle',
  interviewerName = 'Senior AI Technical Interviewer',
  subtitle = 'Tailoring behavioral & technical questions to your candidate profile',
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
      <div className="flex items-center space-x-4">
        {/* Animated AI Avatar Container */}
        <div className="relative shrink-0">
          {/* Pulsing Aura Ring */}
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
              state === 'speaking'
                ? 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-xl shadow-indigo-500/40 animate-pulse ring-4 ring-indigo-500/30'
                : state === 'listening'
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-xl shadow-emerald-500/40 ring-4 ring-emerald-500/30'
                : state === 'evaluating'
                ? 'bg-gradient-to-tr from-amber-600 to-indigo-600 shadow-xl shadow-amber-500/40 animate-spin'
                : 'bg-indigo-600/30 border border-indigo-500/40'
            }`}
          >
            <Brain className="w-8 h-8 text-white" />
          </div>

          {/* Status Indicator Dot */}
          <span
            className={`w-4 h-4 rounded-full border-2 border-slate-900 absolute -bottom-1 -right-1 ${
              state === 'speaking'
                ? 'bg-indigo-400 animate-ping'
                : state === 'listening'
                ? 'bg-emerald-400 animate-bounce'
                : state === 'evaluating'
                ? 'bg-amber-400'
                : 'bg-emerald-500'
            }`}
          />
        </div>

        {/* Title & Subtitle */}
        <div>
          <div className="flex items-center space-x-2 flex-wrap">
            <h3 className="font-bold text-slate-100 text-base sm:text-lg">{interviewerName}</h3>
            <span
              className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                state === 'speaking'
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                  : state === 'listening'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : state === 'evaluating'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {state === 'speaking' && <Volume2 className="w-3 h-3 animate-pulse" />}
              {state === 'listening' && <Mic className="w-3 h-3 animate-pulse" />}
              {state === 'evaluating' && <Activity className="w-3 h-3 animate-spin" />}
              {state === 'idle' && <Sparkles className="w-3 h-3 text-indigo-400" />}
              <span>
                {state === 'speaking'
                  ? 'AI Speaking...'
                  : state === 'listening'
                  ? 'Listening to Candidate...'
                  : state === 'evaluating'
                  ? 'Evaluating Answer...'
                  : 'AI Interviewer Active'}
              </span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-md">{subtitle}</p>
        </div>
      </div>

      {/* Audio Spectrum Waveform Animation Bars */}
      <div className="flex items-center space-x-1 h-8 bg-slate-950 px-4 py-1.5 rounded-xl border border-slate-800/80">
        {[40, 75, 30, 90, 50, 80, 45, 100, 60, 35, 70, 85].map((height, i) => (
          <span
            key={i}
            className={`w-1 rounded-full transition-all duration-300 ${
              state === 'speaking'
                ? 'bg-gradient-to-t from-indigo-500 to-purple-400 animate-pulse'
                : state === 'listening'
                ? 'bg-gradient-to-t from-emerald-500 to-teal-400'
                : 'bg-slate-700'
            }`}
            style={{
              height: state === 'speaking' || state === 'listening' ? `${Math.max(20, (height * (i % 3 + 1)) % 100)}%` : '20%',
              animationDelay: `${i * 0.08}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
