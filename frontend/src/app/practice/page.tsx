'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PreparationPlanWidget } from '@/components/dashboard/PreparationPlanWidget';
import { api } from '@/services/api';
import { JobPosting } from '@/types';
import { useRouter } from 'next/navigation';
import {
  PlayCircle,
  Brain,
  Code,
  Users,
  Briefcase,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Sliders
} from 'lucide-react';

const categories = [
  { id: 'Technical', label: 'Technical Depth', description: 'Framework architecture, Eloquent ORM, DB queries & system design', icon: Code, color: 'text-indigo-400' },
  { id: 'Behavioral', label: 'Behavioral STAR', description: 'Situation, Task, Action, and Result structured questions', icon: Users, color: 'text-emerald-400' },
  { id: 'HR', label: 'HR & Cultural Fit', description: 'Career goals, salary expectations, motivation, teamwork', icon: HelpCircle, color: 'text-amber-400' },
  { id: 'Project-Based', label: 'Project Deep Dive', description: 'System challenges, personal contributions & decisions', icon: Briefcase, color: 'text-sky-400' },
];

export default function PracticePage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState('Technical');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs');
      setJobs(res.data.data);
      if (res.data.data.length > 0) {
        setSelectedJob(res.data.data[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartPractice = async (category: string) => {
    setStarting(true);
    try {
      const res = await api.post('/interviews/start', {
        job_posting_id: selectedJob ? parseInt(selectedJob) : null,
        category,
        mode: 'practice',
        difficulty,
      });

      const sessionId = res.data.data.id;
      router.push(`/mock-interview?session_id=${sessionId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setStarting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <PlayCircle className="w-6 h-6 text-indigo-400" /> Practice Mode
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Focus on specific interview topics with instant AI coaching feedback after every response.
          </p>
        </div>

        {/* Target Job Selector */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Job Vacancy Context</label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="">General Candidate Profile (No Target Job)</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.job_title} ({j.company || 'Target Company'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <label className="text-xs font-semibold text-slate-300">Difficulty:</label>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDifficulty(lvl)}
                  className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                    difficulty === lvl
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Practice Topic Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-6 rounded-2xl transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 bg-slate-800 rounded-xl ${cat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                      PRACTICE MODE
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-100 text-lg">{cat.label}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{cat.description}</p>
                </div>

                <button
                  onClick={() => handleStartPractice(cat.id)}
                  disabled={starting}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center space-x-2 text-xs shadow-lg shadow-indigo-600/20"
                >
                  <span>{starting ? 'Generating Questions...' : `Start ${cat.label} Session`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Preparation Plan Widget */}
        <PreparationPlanWidget />
      </div>
    </DashboardLayout>
  );
}
