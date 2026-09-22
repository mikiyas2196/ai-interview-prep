'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { PreparationPlan } from '@/types';
import { Calendar, CheckCircle2, Circle, RefreshCw, Sparkles, Target } from 'lucide-react';

export const PreparationPlanWidget: React.FC = () => {
  const [plan, setPlan] = useState<PreparationPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const res = await api.get('/plans/current');
      setPlan(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/plans/generate');
      setPlan(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleItem = async (itemId: number) => {
    try {
      await api.put(`/plans/items/${itemId}/toggle`);
      setPlan((prev) => {
        if (!prev || !prev.items) return prev;
        return {
          ...prev,
          items: prev.items.map((item) =>
            item.id === itemId ? { ...item, is_completed: !item.is_completed } : item
          ),
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex justify-center py-10">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const completedCount = plan?.items?.filter((i) => i.is_completed).length || 0;
  const totalCount = plan?.items?.length || 7;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">{plan?.title || 'Personalized 7-Day Prep Plan'}</h3>
            <p className="text-xs text-slate-400">{completedCount} of {totalCount} daily modules completed ({progressPercent}%)</p>
          </div>
        </div>

        <button
          onClick={handleGeneratePlan}
          disabled={generating}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
          <span>{generating ? 'Generating...' : 'Regenerate Plan'}</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
        <div
          className="bg-indigo-500 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Days Schedule */}
      <div className="space-y-2 pt-2">
        {plan?.items?.map((item) => (
          <div
            key={item.id}
            onClick={() => handleToggleItem(item.id)}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between ${
              item.is_completed
                ? 'bg-slate-950/40 border-slate-800/60 opacity-70'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start space-x-3">
              <button className="mt-0.5 text-slate-400">
                {item.is_completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-600 hover:text-indigo-400" />
                )}
              </button>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 px-2 py-0.5 rounded text-indigo-300">
                    Day {item.day_number}
                  </span>
                  <span className={`text-xs font-semibold ${item.is_completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {item.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.description}</p>
              </div>
            </div>

            <span className="text-[10px] text-slate-500 font-mono hidden sm:block shrink-0">
              {item.focus_area}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
