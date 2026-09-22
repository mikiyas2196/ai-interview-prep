'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/services/api';
import { JobPosting, Resume } from '@/types';
import Link from 'next/link';
import {
  Briefcase,
  Plus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  UploadCloud,
  ChevronRight,
  Trash2,
  Cpu,
  Layers
} from 'lucide-react';

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Job Form Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // CV Upload Modal State
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsRes, resumesRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/resumes')
      ]);
      setJobs(jobsRes.data.data);
      setResumes(resumesRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !description) return;
    setCreating(true);
    try {
      await api.post('/jobs', {
        job_title: jobTitle,
        company,
        location,
        raw_description: description,
      });
      setJobTitle('');
      setCompany('');
      setLocation('');
      setDescription('');
      setShowAddModal(false);
      await fetchData();
      setMessage('Target job vacancy created & analyzed with AI!');
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleUploadResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Automatically apply extracted data
      const resumeId = res.data.data.id;
      await api.post(`/resumes/${resumeId}/apply`);

      setResumeFile(null);
      setShowResumeModal(false);
      await fetchData();
      setMessage('CV uploaded & extracted profile details automatically!');
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteJob = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.delete(`/jobs/${id}`);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-indigo-400" /> Target Job Vacancies
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Add job descriptions to let AI extract required technical skills, soft skills, and key interview topics.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowResumeModal(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <UploadCloud className="w-4 h-4 text-indigo-400" /> Upload CV / Resume
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" /> Add Job Vacancy
            </button>
          </div>
        </div>

        {message && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        {/* Resumes Uploaded Status Banner */}
        {resumes.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-200">Active Resume: {resumes[0].file_name}</div>
                <div className="text-slate-400 text-[11px]">AI Extracted skills & projects integrated into candidate profile</div>
              </div>
            </div>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold">
              PROFILE UPDATED
            </span>
          </div>
        )}

        {/* Job Cards List */}
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
            <div className="inline-flex bg-slate-800/80 p-4 rounded-2xl text-slate-400">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">No Target Jobs Added Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Paste a job vacancy description to let AI analyze required skills and generate custom mock interview questions.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl text-xs transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add First Target Job
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-6 rounded-2xl transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {job.company || 'Target Company'}
                      </span>
                      <h3 className="font-bold text-slate-100 text-lg group-hover:text-indigo-300 transition-colors mt-1">
                        {job.job_title}
                      </h3>
                      <p className="text-xs text-slate-400">{job.location || 'Remote'} • {job.experience_level || 'Mid-Level'}</p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteJob(job.id, e)}
                      className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Required Skill Badges */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-indigo-400" /> Extracted Required Skills
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {job.requirements?.required_skills?.slice(0, 5).map((skill, i) => (
                        <span key={i} className="bg-slate-800 text-slate-300 text-xs px-2.5 py-0.5 rounded-lg border border-slate-700/60">
                          {skill}
                        </span>
                      ))}
                      {(job.requirements?.required_skills?.length || 0) > 5 && (
                        <span className="text-xs text-slate-500 self-center">
                          +{(job.requirements?.required_skills?.length || 0) - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium text-indigo-400">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> View Skill Gap Analysis
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* MODAL 1: ADD JOB VACANCY */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-400" /> Add Target Job Vacancy
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleCreateJob} className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Laravel Developer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Company</label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Tech"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Raw Job Description (Paste here)</label>
                  <textarea
                    rows={6}
                    required
                    placeholder="Paste full job description requirements, responsibilities, and required tech stack..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2"
                  >
                    {creating ? 'Analyzing with AI...' : 'Create & Analyze Job'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: UPLOAD CV */}
        {showResumeModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-indigo-400" /> Upload Candidate CV / Resume
                </h3>
                <button onClick={() => setShowResumeModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleUploadResume} className="space-y-4 text-sm">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upload your CV (PDF, DOCX, or TXT). AI will extract your technical skills, work experiences, and projects into your candidate profile.
                </p>

                <input
                  type="file"
                  required
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-300 text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                />

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResumeModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !resumeFile}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2"
                  >
                    {uploading ? 'Extracting Text...' : 'Upload & Auto-Populate'}
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
