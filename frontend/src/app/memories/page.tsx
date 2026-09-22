'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/services/api';
import { CandidateMemory } from '@/types';
import {
  Brain,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function MemoriesPage() {
  const [memories, setMemories] = useState<CandidateMemory[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Edit Memory Modal State
  const [editingMemory, setEditingMemory] = useState<CandidateMemory | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/memories');
      setMemories(res.data.data);
      setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMemory) return;
    setSaving(true);
    try {
      await api.put(`/memories/${editingMemory.id}`, {
        description: editDesc,
        sentiment: editingMemory.sentiment,
      });
      setEditingMemory(null);
      await fetchMemories();
      setMessage('Memory description updated successfully.');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMemory = async (id: number) => {
    try {
      await api.delete(`/memories/${id}`);
      await fetchMemories();
      setMessage('Memory deleted.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all stored interview memories? This cannot be undone.')) return;
    try {
      await api.post('/memories/clear');
      await fetchMemories();
      setMessage('All interview memories cleared.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
              <Brain className="w-6 h-6 text-indigo-400" /> Candidate AI Memory Privacy & Controls
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              You are in full control of what the AI coach remembers about your performance, strengths, and weak areas.
            </p>
          </div>

          <button
            onClick={handleClearAll}
            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear All Interview Memories
          </button>
        </div>

        {message && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        {/* AI Memory Insights Breakdown Card */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Identified Candidate Strengths ({summary.strengths?.length || 0})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {summary.strengths?.map((s: string, i: number) => (
                  <span key={i} className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-lg">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Targeted Practice Weaknesses ({summary.weaknesses?.length || 0})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {summary.weaknesses?.map((w: string, i: number) => (
                  <span key={i} className="bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs px-2.5 py-1 rounded-lg">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stored Memories List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" /> Active Candidate Memory Entries ({memories.length})
            </h3>
            <button onClick={fetchMemories} className="text-slate-400 hover:text-slate-200 p-1">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="py-10 flex justify-center">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : memories.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs space-y-2">
              <Brain className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
              <p>No candidate memories stored yet. Complete mock interviews to start extracting memory insights.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {memories.map((mem) => (
                <div
                  key={mem.id}
                  className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-start justify-between gap-4"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        mem.sentiment === 'strength'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {mem.sentiment}
                      </span>
                      <span className="font-bold text-slate-200">{mem.topic}</span>
                      <span className="text-slate-500 text-[10px]">Confidence: {Math.round(mem.confidence * 100)}%</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">{mem.description}</p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingMemory(mem);
                        setEditDesc(mem.description);
                      }}
                      className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
                      title="Edit Memory Description"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMemory(mem.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                      title="Delete Memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Memory Modal */}
        {editingMemory && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-100 text-base">Edit Memory Entry</h3>
                <button onClick={() => setEditingMemory(null)} className="text-slate-400">✕</button>
              </div>

              <form onSubmit={handleUpdateMemory} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Topic</label>
                  <input
                    type="text"
                    disabled
                    value={editingMemory.topic}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Description</label>
                  <textarea
                    rows={4}
                    required
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingMemory(null)}
                    className="px-3 py-2 text-slate-400 hover:bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
