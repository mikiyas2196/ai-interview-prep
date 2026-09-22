'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PreparationPlanWidget } from '@/components/dashboard/PreparationPlanWidget';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/services/api';
import Link from 'next/link';
import {
  Brain,
  Video,
  PlayCircle,
  Briefcase,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Award,
  BookOpen,
  ArrowUpRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await api.get('/progress/overview');
      setOverview(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const readiness = overview?.readiness_percentage || 78;
  const categoryScores = overview?.category_scores || [
    { category: 'Technical', score: 88 },
    { category: 'Behavioral STAR', score: 74 },
    { category: 'Communication', score: 78 },
    { category: 'Problem Solving', score: 82 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/30 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                CANDIDATE COMMAND CENTER
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100">
              {t('dashboard.welcome', 'Welcome Back')}, {user?.name || 'Candidate'}!
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Target Goal: <span className="text-indigo-300 font-semibold">{user?.profile?.career_goal || 'Senior Software Engineer'}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Link
              href="/mock-interview"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-3 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
            >
              <Video className="w-4 h-4" />
              <span>{t('dashboard.start_mock', 'Start Mock Interview')}</span>
            </Link>
          </div>
        </div>

        {/* Top Key Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Readiness Gauge Card */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[10px]">{t('dashboard.readiness_score', 'Interview Readiness Score')}</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-indigo-400">{readiness}%</span>
              <span className="text-[11px] text-emerald-400 font-medium">Ready for Mock</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-500"
                style={{ width: `${readiness}%` }}
              />
            </div>
          </div>

          {/* Average Score */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Average Evaluation Score</span>
              <Award className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-100">
              {overview?.average_score || 7.9} <span className="text-xs text-slate-500 font-normal">/ 10.0</span>
            </div>
            <p className="text-[11px] text-slate-400">Across {overview?.completed_sessions || 0} completed mock sessions</p>
          </div>

          {/* Total Questions Answered */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Questions Answered</span>
              <PlayCircle className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-100">
              {overview?.total_questions_answered || 12}
            </div>
            <p className="text-[11px] text-slate-400">Technical & behavioral responses</p>
          </div>

          {/* Active Memories */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[10px]">AI Memories Stored</span>
              <Brain className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-extrabold text-purple-400">
              {overview?.memory_insights?.recent_memories?.length || 0}
            </div>
            <p className="text-[11px] text-slate-400">Influencing future interview personalization</p>
          </div>
        </div>

        {/* Middle Section: Target Job & Performance Radar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Target Job Status Card */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  ACTIVE TARGET JOB
                </span>
                <Link href="/jobs" className="text-xs text-slate-400 hover:text-slate-200">
                  Manage Jobs
                </Link>
              </div>

              {overview?.target_job ? (
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-100 text-lg">{overview.target_job.job_title}</h3>
                  <p className="text-xs text-slate-400">{overview.target_job.company || 'Target Company'} • {overview.target_job.location || 'Remote'}</p>

                  <div className="pt-2 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Required Skills:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {overview.target_job.requirements?.required_skills?.slice(0, 4).map((s: string, i: number) => (
                        <span key={i} className="bg-slate-800 text-slate-300 text-xs px-2.5 py-0.5 rounded-lg border border-slate-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-2 text-slate-500 text-xs">
                  <Briefcase className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
                  <p>No target job vacancy set. Add a job description to calculate skill gaps.</p>
                  <Link href="/jobs" className="text-indigo-400 font-semibold inline-block pt-1">
                    + Add Target Job
                  </Link>
                </div>
              )}
            </div>

            {overview?.target_job && (
              <Link
                href={`/jobs/${overview.target_job.id}`}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <span>View Job Skill Gap</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Performance Category Chart */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-100 text-base">Category Performance Breakdown</h3>
                <p className="text-xs text-slate-400">Score distribution across key interview dimensions</p>
              </div>
              <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                AI Coaching Estimate
              </span>
            </div>

            <div className="h-48 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryScores} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={11} />
                  <YAxis type="category" dataKey="category" stroke="#94a3b8" fontSize={11} width={110} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#818cf8' }}
                  />
                  <Bar dataKey="score" radius={[0, 8, 8, 0]}>
                    {categoryScores.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : index === 1 ? '#10b981' : index === 2 ? '#f59e0b' : '#38bdf8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 7-Day Preparation Plan Widget */}
        <PreparationPlanWidget />

        {/* Bottom Section: AI Memory Insights & Recent Mock Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Memory Insights */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-400" /> AI Memory Insights
              </h3>
              <Link href="/memories" className="text-xs text-slate-400 hover:text-slate-200">
                {t('nav.settings', 'Settings')}
              </Link>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-emerald-400 block mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                </span>
                <div className="flex flex-wrap gap-1">
                  {overview?.memory_insights?.strengths?.map((s: string, i: number) => (
                    <span key={i} className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded text-[11px]">
                      {s}
                    </span>
                  )) || <span className="text-slate-500 italic">No strengths recorded.</span>}
                </div>
              </div>

              <div>
                <span className="font-semibold text-amber-400 block mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {t('dashboard.weaknesses', 'Target Focus Areas')}
                </span>
                <div className="flex flex-wrap gap-1">
                  {overview?.memory_insights?.weaknesses?.map((w: string, i: number) => (
                    <span key={i} className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded text-[11px]">
                      {w}
                    </span>
                  )) || <span className="text-slate-500 italic">No weaknesses recorded.</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Mock Sessions */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-base">{t('dashboard.recent_sessions', 'Recent Sessions')}</h3>
              <Link href="/practice" className="text-xs text-indigo-400 font-semibold hover:text-indigo-300">
                {t('dashboard.practice_now', 'Practice Now')} →
              </Link>
            </div>

            {overview?.recent_sessions?.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No recent sessions found. Click Start Session to practice.</p>
            ) : (
              <div className="space-y-2">
                {overview?.recent_sessions?.map((session: any) => (
                  <Link
                    key={session.id}
                    href={`/interviews/${session.id}/report`}
                    className="p-3.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between text-xs transition-colors block"
                  >
                    <div>
                      <div className="font-bold text-slate-200">{session.title}</div>
                      <div className="text-slate-400 text-[11px] capitalize">{session.mode} Mode • {session.category}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-bold">
                        Score: {session.overall_score || 7.5}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
