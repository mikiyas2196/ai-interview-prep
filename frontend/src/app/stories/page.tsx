'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/services/api';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  Layers,
  Save
} from 'lucide-react';

interface Story {
  id: number;
  title: string;
  situation?: string;
  task?: string;
  action?: string;
  result?: string;
  lessons_learned?: string;
  technologies?: string[];
  tags?: string[];
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [situation, setSituation] = useState('');
  const [task, setTask] = useState('');
  const [action, setAction] = useState('');
  const [result, setResult] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stories');
      setStories(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setSaving(true);
    try {
      await api.post('/stories', {
        title,
        situation,
        task,
        action,
        result,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      });

      setTitle('');
      setSituation('');
      setTask('');
      setAction('');
      setResult('');
      setTags('');
      setShowAddModal(false);
      await fetchStories();
      setMessage('Project story created & added to Story Bank!');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStory = async (id: number) => {
    try {
      await api.delete(`/stories/${id}`);
      await fetchStories();
      setMessage('Story deleted.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-400" /> Candidate Interview Story Bank
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Build a reusable library of STAR project stories (Situation, Task, Action, Result). The AI will recommend your stories during live mock interviews!
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-600/20 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Project Story
          </button>
        </div>

        {message && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        {/* Stories List */}
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : stories.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
            <div className="inline-flex bg-slate-800 p-4 rounded-2xl text-slate-400">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">Your Story Bank is Empty</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Record key engineering challenges and achievements in STAR format so the AI coach can recommend them during interview practice.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl text-xs transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create First STAR Story
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stories.map((story) => (
              <div
                key={story.id}
                className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-slate-100 text-base">{story.title}</h3>
                    <button
                      onClick={() => handleDeleteStory(story.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    {story.situation && (
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="font-bold text-indigo-400 uppercase tracking-wider block mb-0.5 text-[10px]">Situation & Task</span>
                        <p className="text-slate-300 leading-relaxed">{story.situation} {story.task}</p>
                      </div>
                    )}

                    {story.action && (
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="font-bold text-emerald-400 uppercase tracking-wider block mb-0.5 text-[10px]">Action Taken</span>
                        <p className="text-slate-300 leading-relaxed">{story.action}</p>
                      </div>
                    )}

                    {story.result && (
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="font-bold text-amber-400 uppercase tracking-wider block mb-0.5 text-[10px]">Quantifiable Result</span>
                        <p className="text-slate-300 leading-relaxed">{story.result}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-1.5">
                  {story.tags?.map((t, i) => (
                    <span key={i} className="bg-slate-800 text-slate-300 text-[11px] px-2.5 py-0.5 rounded-lg border border-slate-700">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Story Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" /> Add STAR Project Story
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400">✕</button>
              </div>

              <form onSubmit={handleCreateStory} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Story Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lab Reservation System Bottleneck Optimization"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Situation (Context)</label>
                    <textarea
                      rows={2}
                      placeholder="What was the situation or challenge?"
                      value={situation}
                      onChange={(e) => setSituation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Task (Responsibility)</label>
                    <textarea
                      rows={2}
                      placeholder="What was your specific responsibility?"
                      value={task}
                      onChange={(e) => setTask(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Action (What you did)</label>
                  <textarea
                    rows={3}
                    placeholder="Specific technical actions, tools, architectural decisions..."
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Result (Quantifiable Outcome)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Reduced response latency by 45% and eliminated 100% of double bookings."
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Laravel, Database Optimization, Problem Solving"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-slate-400 hover:bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl font-semibold flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save to Story Bank</span>
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
