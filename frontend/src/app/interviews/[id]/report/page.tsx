'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/services/api';
import { InterviewSession, InterviewReport } from '@/types';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Award,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  BarChart3,
  FileText,
  PlayCircle,
  ArrowLeft
} from 'lucide-react';

export const dynamic = 'force-dynamic';

function InterviewReportContent() {
  const params = useParams();
  const sessionId = params?.id;

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetchReport();
    }
  }, [sessionId]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/interviews/${sessionId}/report`);
      setSession(res.data.session);
      setReport(res.data.report);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session || !report) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Interview report not found.</p>
        <Link href="/dashboard" className="text-indigo-400 font-semibold text-xs mt-2 inline-block">
          ← Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <Link href="/dashboard" className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </Link>

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase">
            COMPLETED MOCK REPORT
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 mt-1">{session.title}</h1>
          <p className="text-xs text-slate-400">
            Job Context: {session.job_posting?.job_title || 'Software Engineer'} • Category: {session.category}
          </p>
        </div>

        <div className="flex items-center space-x-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="text-center">
            <div className="text-3xl font-extrabold text-indigo-400">{report.overall_score} / 10</div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Overall Score</div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-center">
            <div className="text-3xl font-extrabold text-emerald-400">{report.readiness_percentage}%</div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Readiness Score</div>
          </div>
        </div>
      </div>

      {/* Summary Box */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
        <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" /> AI Executive Summary
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">{report.summary}</p>
      </div>

      {/* Strengths & Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
          <h3 className="font-bold text-emerald-400 text-sm uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Demonstrated Key Strengths
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {report.strengths?.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
          <h3 className="font-bold text-amber-400 text-sm uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Targeted Improvement Areas
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {report.weaknesses?.map((w, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Answer-by-Answer Evaluation Breakdown */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-400" /> Detailed Question Evaluation Breakdown
        </h3>

        <div className="space-y-4">
          {session.questions?.map((q) => {
            const evalData = q.answer?.evaluation;
            return (
              <div key={q.id} className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-300">
                    Question #{q.question_number}: {q.question_text}
                  </span>
                  {evalData && (
                    <span className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-bold px-2.5 py-0.5 rounded-full">
                      Score: {evalData.overall_score} / 10
                    </span>
                  )}
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-slate-300">
                  <span className="font-semibold text-slate-400 block mb-1">Your Answer:</span>
                  {q.answer?.answer_text || 'No answer submitted'}
                </div>

                {evalData?.coaching_feedback && (
                  <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-lg text-indigo-300">
                    <span className="font-semibold block mb-0.5">AI Coaching Feedback:</span>
                    {evalData.coaching_feedback}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggested Next Practice */}
      <div className="bg-indigo-600/20 border border-indigo-500/30 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400" /> AI Long-Term Memory Updated
          </h3>
          <p className="text-xs text-slate-400">
            Identified weaknesses have been extracted into your AI candidate memory bank for future personalization.
          </p>
        </div>

        <Link
          href="/practice"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shrink-0"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Start Targeted Weakness Practice</span>
        </Link>
      </div>
    </div>
  );
}

export default function InterviewReportPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <InterviewReportContent />
      </Suspense>
    </DashboardLayout>
  );
}
