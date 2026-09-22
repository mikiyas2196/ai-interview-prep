'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/services/api';
import { JobPosting, SkillGap } from '@/types';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Cpu,
  Layers,
  PlayCircle,
  RefreshCw
} from 'lucide-react';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id;

  const [job, setJob] = useState<JobPosting | null>(null);
  const [skillGap, setSkillGap] = useState<SkillGap | null>(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/jobs/${jobId}`);
      setJob(res.data.data);
      setSkillGap(res.data.skill_gap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReanalyze = async () => {
    setReanalyzing(true);
    try {
      const res = await api.post(`/jobs/${jobId}/analyze`);
      setJob(res.data.data);
      setSkillGap(res.data.skill_gap);
    } catch (err) {
      console.error(err);
    } finally {
      setReanalyzing(false);
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

  if (!job) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-slate-400">Job vacancy not found.</p>
          <Link href="/jobs" className="text-indigo-400 font-semibold text-xs mt-2 inline-block">
            ← Return to Jobs
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Link */}
        <Link href="/jobs" className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Target Jobs
        </Link>

        {/* Job Header Banner */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {job.company || 'Target Job'}
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 mt-1">
              {job.job_title}
            </h1>
            <p className="text-xs text-slate-400">
              {job.location || 'Remote'} • Experience Level: {job.experience_level || 'Mid-Level'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleReanalyze}
              disabled={reanalyzing}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${reanalyzing ? 'animate-spin' : ''}`} />
              <span>{reanalyzing ? 'Analyzing...' : 'Re-Analyze AI'}</span>
            </button>
            <Link
              href={`/practice?job_id=${job.id}`}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
            >
              <PlayCircle className="w-4 h-4" /> Start Targeted Practice
            </Link>
          </div>
        </div>

        {/* Skill Gap Analysis Box */}
        {skillGap && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Candidate Skill Gap Analysis</h3>
                  <p className="text-xs text-slate-400">Cross-referencing your candidate profile skills against required vacancy skills</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-extrabold text-indigo-400">{skillGap.match_percentage}%</div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Requirements Match</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-500"
                style={{ width: `${skillGap.match_percentage}%` }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Matching Skills */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Matching Skills ({skillGap.matching_skills.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skillGap.matching_skills.map((skill, i) => (
                    <span key={i} className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-lg">
                      ✓ {skill}
                    </span>
                  ))}
                  {skillGap.matching_skills.length === 0 && (
                    <span className="text-xs text-slate-500 italic">No matching skills identified yet.</span>
                  )}
                </div>
              </div>

              {/* Missing / Gap Skills */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Preparation Gaps ({skillGap.missing_skills.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {skillGap.missing_skills.map((skill, i) => (
                    <span key={i} className="bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs px-2.5 py-1 rounded-lg">
                      ! {skill}
                    </span>
                  ))}
                  {skillGap.missing_skills.length === 0 && (
                    <span className="text-xs text-emerald-400 font-medium">100% of required vacancy skills matched!</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Extracted AI Requirements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Required Skills & Technical Stack */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" /> Technical Requirements
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-1 font-semibold">Core Required Skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {job.requirements?.required_skills?.map((s, i) => (
                    <span key={i} className="bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {job.requirements?.preferred_skills && job.requirements.preferred_skills.length > 0 && (
                <div>
                  <span className="text-slate-400 block mb-1 font-semibold">Preferred Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {job.requirements.preferred_skills.map((s, i) => (
                      <span key={i} className="bg-slate-950 text-slate-400 px-2.5 py-1 rounded-lg border border-slate-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Key Interview Topics & Soft Skills */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-100 text-sm uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" /> Interview Topics & Responsibilities
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-1 font-semibold">Key Topics to Practice:</span>
                <div className="flex flex-wrap gap-1.5">
                  {job.requirements?.key_topics?.map((t, i) => (
                    <span key={i} className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-lg font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1 font-semibold">Core Responsibilities:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {job.requirements?.responsibilities?.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
