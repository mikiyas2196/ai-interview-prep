'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  AlertCircle,
  Sparkles,
  UploadCloud,
  FileText,
  Loader2,
  X,
  CheckCircle2
} from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'general' | 'skills' | 'experience' | 'education' | 'projects'>('general');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile General Form State
  const [fullName, setFullName] = useState(user?.profile?.full_name || user?.name || '');
  const [headline, setHeadline] = useState(user?.profile?.professional_headline || '');
  const [location, setLocation] = useState(user?.profile?.location || '');
  const [phone, setPhone] = useState(user?.profile?.phone || '');
  const [careerGoal, setCareerGoal] = useState(user?.profile?.career_goal || '');
  const [summary, setSummary] = useState(user?.profile?.professional_summary || '');
  const [targetRoles, setTargetRoles] = useState<string>(user?.profile?.target_roles ? user.profile.target_roles.join(', ') : '');

  // Add Skill Modal/Form
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<'technical' | 'soft' | 'language' | 'domain'>('technical');
  const [newSkillLevel, setNewSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('advanced');
  const [newSkillYrs, setNewSkillYrs] = useState(3);

  // Add Experience Form State
  const [expCompany, setExpCompany] = useState('');
  const [expTitle, setExpTitle] = useState('');
  const [expLocation, setExpLocation] = useState('');
  const [expType, setExpType] = useState('full-time');
  const [expStartDate, setExpStartDate] = useState('');
  const [expEndDate, setExpEndDate] = useState('');
  const [expDesc, setExpDesc] = useState('');

  // Add Education Form State
  const [eduInst, setEduInst] = useState('');
  const [eduDegree, setEduDegree] = useState('');
  const [eduField, setEduField] = useState('');
  const [eduStart, setEduStart] = useState('');
  const [eduEnd, setEduEnd] = useState('');

  // Add Project Form State
  const [projTitle, setProjTitle] = useState('');
  const [projRole, setProjRole] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projTech, setProjTech] = useState('');

  // Insert CV Modal State
  const [showCvModal, setShowCvModal] = useState(false);
  const [selectedCvFile, setSelectedCvFile] = useState<File | null>(null);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [cvStep, setCvStep] = useState<'idle' | 'uploading' | 'parsing' | 'applying' | 'done' | 'error'>('idle');
  const [cvErrorMessage, setCvErrorMessage] = useState('');
  const [extractedCvSummary, setExtractedCvSummary] = useState<any>(null);

  // Sync state when user context updates
  useEffect(() => {
    if (user) {
      setFullName(user.profile?.full_name || user.name || '');
      setHeadline(user.profile?.professional_headline || '');
      setLocation(user.profile?.location || '');
      setPhone(user.profile?.phone || '');
      setCareerGoal(user.profile?.career_goal || '');
      setSummary(user.profile?.professional_summary || '');
      setTargetRoles(user.profile?.target_roles ? user.profile.target_roles.join(', ') : '');
    }
  }, [user]);

  const handleUpdateGeneralProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await api.put('/profile', {
        full_name: fullName,
        professional_headline: headline,
        location,
        phone,
        career_goal: careerGoal,
        professional_summary: summary,
        target_roles: targetRoles.split(',').map(r => r.trim()).filter(Boolean),
      });
      await refreshUser();
      setMessage({ type: 'success', text: 'Candidate profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleUploadAndApplyCv = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedCvFile) return;

    setUploadingCv(true);
    setCvStep('uploading');
    setCvErrorMessage('');
    setExtractedCvSummary(null);

    const formData = new FormData();
    formData.append('resume', selectedCvFile);

    try {
      setCvStep('parsing');
      let data: any = null;

      try {
        // Attempt single-step endpoint first
        const res = await api.post('/resumes/upload-and-apply', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        data = res.data;
      } catch (directErr: any) {
        // Fallback to standard 2-step process if single-step endpoint is 404
        if (directErr.response?.status === 404) {
          const uploadRes = await api.post('/resumes/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          const resumeId = uploadRes.data?.data?.id;
          if (!resumeId) {
            throw new Error('Resume uploaded but failed to retrieve resume ID.');
          }

          setCvStep('applying');
          const applyRes = await api.post(`/resumes/${resumeId}/apply`);
          data = applyRes.data;
        } else {
          throw directErr;
        }
      }

      setCvStep('applying');
      const parsedData = data.parsed_data || data.data?.parsed_data || null;
      const updatedUser = data.user || data.data?.user || null;

      setExtractedCvSummary(parsedData || null);

      if (updatedUser?.profile) {
        if (updatedUser.profile.full_name) setFullName(updatedUser.profile.full_name);
        if (updatedUser.profile.professional_headline) setHeadline(updatedUser.profile.professional_headline);
        if (updatedUser.profile.location) setLocation(updatedUser.profile.location);
        if (updatedUser.profile.phone) setPhone(updatedUser.profile.phone);
        if (updatedUser.profile.career_goal) setCareerGoal(updatedUser.profile.career_goal);
        if (updatedUser.profile.professional_summary) setSummary(updatedUser.profile.professional_summary);
        if (updatedUser.profile.target_roles) {
          setTargetRoles(Array.isArray(updatedUser.profile.target_roles) ? updatedUser.profile.target_roles.join(', ') : String(updatedUser.profile.target_roles));
        }
      } else if (parsedData) {
        if (parsedData.full_name) setFullName(parsedData.full_name);
        if (parsedData.professional_headline) setHeadline(parsedData.professional_headline);
        if (parsedData.location) setLocation(parsedData.location);
        if (parsedData.phone) setPhone(parsedData.phone);
        if (parsedData.summary) setSummary(parsedData.summary);
        if (parsedData.target_roles) {
          setTargetRoles(Array.isArray(parsedData.target_roles) ? parsedData.target_roles.join(', ') : String(parsedData.target_roles));
        }
      }

      await refreshUser();

      setCvStep('done');
      setMessage({
        type: 'success',
        text: 'CV uploaded successfully! Profile details, skills, work history, education and projects have been filled by AI.',
      });
    } catch (err: any) {
      console.error('CV Upload error:', err);
      setCvStep('error');
      const apiMsg = err.response?.data?.message || err.message;
      setCvErrorMessage(apiMsg || 'Failed to parse and extract CV. Please ensure the file is in PDF, DOCX, or TXT format.');
    } finally {
      setUploadingCv(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName) return;
    setSaving(true);
    try {
      await api.post('/profile/skills', {
        name: newSkillName,
        category: newSkillCategory,
        proficiency_level: newSkillLevel,
        years_of_experience: newSkillYrs,
      });
      setNewSkillName('');
      await refreshUser();
      setMessage({ type: 'success', text: 'Skill added to profile' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to add skill.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSkill = async (id: number) => {
    try {
      await api.delete(`/profile/skills/${id}`);
      await refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expCompany || !expTitle) return;
    setSaving(true);
    try {
      await api.post('/profile/experience', {
        company: expCompany,
        title: expTitle,
        location: expLocation,
        type: expType,
        start_date: expStartDate,
        end_date: expEndDate,
        is_current: !expEndDate,
        description: expDesc,
      });
      setExpCompany('');
      setExpTitle('');
      setExpDesc('');
      await refreshUser();
      setMessage({ type: 'success', text: 'Experience record added!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to add experience.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExperience = async (id: number) => {
    try {
      await api.delete(`/profile/experience/${id}`);
      await refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduInst || !eduDegree) return;
    setSaving(true);
    try {
      await api.post('/profile/education', {
        institution: eduInst,
        degree: eduDegree,
        field_of_study: eduField,
        start_date: eduStart,
        end_date: eduEnd,
      });
      setEduInst('');
      setEduDegree('');
      setEduField('');
      await refreshUser();
      setMessage({ type: 'success', text: 'Education record added!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to add education.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEducation = async (id: number) => {
    try {
      await api.delete(`/profile/education/${id}`);
      await refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle) return;
    setSaving(true);
    try {
      await api.post('/profile/projects', {
        title: projTitle,
        role: projRole,
        description: projDesc,
        technologies: projTech.split(',').map(t => t.trim()).filter(Boolean),
      });
      setProjTitle('');
      setProjRole('');
      setProjDesc('');
      setProjTech('');
      await refreshUser();
      setMessage({ type: 'success', text: 'Project added to profile!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to add project.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (id: number) => {
    try {
      await api.delete(`/profile/projects/${id}`);
      await refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header section with Insert CV button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
              <User className="w-6 h-6 text-indigo-400" /> Candidate Profile
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Maintain your professional background. The AI interviewer uses this data to customize question generation.
            </p>
          </div>
          <button
            onClick={() => {
              setShowCvModal(true);
              setCvStep('idle');
              setSelectedCvFile(null);
              setExtractedCvSummary(null);
            }}
            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 border border-indigo-400/30 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Insert CV (AI Auto-Fill)</span>
          </button>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {message.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 space-x-1 overflow-x-auto text-sm">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2.5 font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" /> General Info
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-4 py-2.5 font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'skills'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-4 h-4" /> Skills ({user?.skills?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('experience')}
            className={`px-4 py-2.5 font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'experience'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" /> Work History ({user?.experiences?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('education')}
            className={`px-4 py-2.5 font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'education'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" /> Education ({user?.educations?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2.5 font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'projects'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderGit2 className="w-4 h-4" /> Projects ({user?.projects?.length || 0})
          </button>
        </div>

        {/* TAB 1: GENERAL INFO */}
        {activeTab === 'general' && (
          <form onSubmit={handleUpdateGeneralProfile} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Professional Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Backend / Full Stack Engineer"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Roles (comma-separated)</label>
              <input
                type="text"
                placeholder="Senior Laravel Developer, Backend Architect, Full Stack Engineer"
                value={targetRoles}
                onChange={(e) => setTargetRoles(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Career Goal Statement</label>
              <textarea
                rows={2}
                placeholder="Describe your current target job objectives..."
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Professional Summary</label>
              <textarea
                rows={4}
                placeholder="Comprehensive professional overview..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: SKILLS */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <form onSubmit={handleAddSkill} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-sm space-y-4">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" /> Add New Skill
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Skill name (e.g. Laravel, Redis)"
                  required
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
                <select
                  value={newSkillCategory}
                  onChange={(e: any) => setNewSkillCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="technical">Technical</option>
                  <option value="soft">Soft Skill</option>
                  <option value="domain">Domain Knowledge</option>
                </select>
                <select
                  value={newSkillLevel}
                  onChange={(e: any) => setNewSkillLevel(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl px-4 py-2 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Skill</span>
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {user?.skills?.map((skill) => (
                <div key={skill.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-100 text-sm">{skill.name}</div>
                    <div className="text-xs text-slate-400 capitalize">
                      {skill.proficiency_level} • {skill.years_of_experience} yrs
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSkill(skill.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: WORK HISTORY */}
        {activeTab === 'experience' && (
          <div className="space-y-6">
            <form onSubmit={handleAddExperience} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-sm space-y-4">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" /> Add Work Experience
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Company Name"
                  required
                  value={expCompany}
                  onChange={(e) => setExpCompany(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
                <input
                  type="text"
                  placeholder="Job Title"
                  required
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
                <input
                  type="text"
                  placeholder="Start Date (e.g. 2022-06)"
                  value={expStartDate}
                  onChange={(e) => setExpStartDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
                <input
                  type="text"
                  placeholder="End Date (or leave blank if current)"
                  value={expEndDate}
                  onChange={(e) => setExpEndDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Description of key achievements and tech stack..."
                value={expDesc}
                onChange={(e) => setExpDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Add Experience
              </button>
            </form>

            <div className="space-y-3">
              {user?.experiences?.map((exp) => (
                <div key={exp.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-100 text-base">{exp.title}</h4>
                    <p className="text-xs text-indigo-400 font-medium">{exp.company} • {exp.start_date} - {exp.end_date || 'Present'}</p>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{exp.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteExperience(exp.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: EDUCATION */}
        {activeTab === 'education' && (
          <div className="space-y-6">
            <form onSubmit={handleAddEducation} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-sm space-y-4">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" /> Add Education
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Institution / University"
                  required
                  value={eduInst}
                  onChange={(e) => setEduInst(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
                <input
                  type="text"
                  placeholder="Degree (e.g. Bachelor of Science)"
                  required
                  value={eduDegree}
                  onChange={(e) => setEduDegree(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
                <input
                  type="text"
                  placeholder="Field of Study (e.g. Computer Science)"
                  value={eduField}
                  onChange={(e) => setEduField(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Add Education Record
              </button>
            </form>

            <div className="space-y-3">
              {user?.educations?.map((edu) => (
                <div key={edu.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-100">{edu.degree} in {edu.field_of_study}</h4>
                    <p className="text-xs text-indigo-400 font-medium">{edu.institution} • {edu.start_date} - {edu.end_date}</p>
                  </div>
                  <button onClick={() => handleDeleteEducation(edu.id)} className="p-1.5 text-slate-500 hover:text-rose-400 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <form onSubmit={handleAddProject} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-sm space-y-4">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" /> Add Technical Project
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Project Title"
                  required
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
                <input
                  type="text"
                  placeholder="Your Role (e.g. Lead Backend Engineer)"
                  value={projRole}
                  onChange={(e) => setProjRole(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
              <input
                type="text"
                placeholder="Technologies (comma-separated, e.g. Laravel, React, MySQL)"
                value={projTech}
                onChange={(e) => setProjTech(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
              />
              <textarea
                rows={2}
                placeholder="Project overview & key technical accomplishments..."
                value={projDesc}
                onChange={(e) => setProjDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Add Project
              </button>
            </form>

            <div className="space-y-3">
              {user?.projects?.map((proj) => (
                <div key={proj.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-100 text-base">{proj.title}</h4>
                    <p className="text-xs text-indigo-400 font-medium">{proj.role}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{proj.description}</p>
                  </div>
                  <button onClick={() => handleDeleteProject(proj.id)} className="p-1.5 text-slate-500 hover:text-rose-400 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* INSERT CV MODAL */}
      {showCvModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-0">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Insert CV with AI</h3>
                  <p className="text-xs text-slate-400">Upload your resume to automatically fill profile details</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!uploadingCv) setShowCvModal(false);
                }}
                disabled={uploadingCv}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {cvStep === 'error' && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Upload Failed</div>
                    <div className="mt-0.5">{cvErrorMessage}</div>
                  </div>
                </div>
              )}

              {cvStep === 'done' && extractedCvSummary ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-emerald-300">Profile Populated Successfully!</h4>
                      <p className="mt-0.5">The AI analyzed your document and automatically filled your candidate profile details.</p>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-3">
                    <div className="font-semibold text-slate-300 border-b border-slate-800 pb-2">Extracted Data Overview</div>
                    {extractedCvSummary.full_name && (
                      <div className="flex justify-between py-1 border-b border-slate-800/50">
                        <span className="text-slate-400">Full Name</span>
                        <span className="text-slate-100 font-medium">{extractedCvSummary.full_name}</span>
                      </div>
                    )}
                    {extractedCvSummary.professional_headline && (
                      <div className="flex justify-between py-1 border-b border-slate-800/50">
                        <span className="text-slate-400">Headline</span>
                        <span className="text-slate-100 font-medium">{extractedCvSummary.professional_headline}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-center">
                        <div className="text-lg font-bold text-indigo-400">{extractedCvSummary.skills?.length || 0}</div>
                        <div className="text-[11px] text-slate-400">Skills Extracted</div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-center">
                        <div className="text-lg font-bold text-indigo-400">{extractedCvSummary.experience?.length || 0}</div>
                        <div className="text-[11px] text-slate-400">Work Histories</div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-center">
                        <div className="text-lg font-bold text-indigo-400">{extractedCvSummary.education?.length || 0}</div>
                        <div className="text-[11px] text-slate-400">Educations</div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-center">
                        <div className="text-lg font-bold text-indigo-400">{extractedCvSummary.projects?.length || 0}</div>
                        <div className="text-[11px] text-slate-400">Projects</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : uploadingCv ? (
                <div className="py-8 text-center space-y-4">
                  <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 text-indigo-400 rounded-full animate-bounce">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-100 text-sm">
                      {cvStep === 'uploading' && 'Uploading Document...'}
                      {cvStep === 'parsing' && 'AI Parsing & Extracting Information...'}
                      {cvStep === 'applying' && 'Updating Candidate Profile Automatically...'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">Please wait while Gemini AI analyzes your experience and skills.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUploadAndApplyCv} className="space-y-4">
                  {/* File Drag and Drop Zone */}
                  <div
                    onClick={() => document.getElementById('cv-file-input')?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      selectedCvFile
                        ? 'border-indigo-500/60 bg-indigo-500/5'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
                    }`}
                  >
                    <input
                      id="cv-file-input"
                      type="file"
                      accept=".pdf,.docx,.txt"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedCvFile(e.target.files[0]);
                        }
                      }}
                    />

                    {selectedCvFile ? (
                      <div className="flex items-center justify-center space-x-3 text-left">
                        <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-100 text-sm truncate max-w-[240px]">
                            {selectedCvFile.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {(selectedCvFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI extraction
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="inline-flex p-3 bg-slate-800 text-indigo-400 rounded-xl">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <div className="text-sm font-medium text-slate-200">
                          Click or drag resume here to upload
                        </div>
                        <div className="text-xs text-slate-500">
                          Supports PDF, DOCX, TXT files up to 10MB
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end space-x-3">
              {cvStep === 'done' ? (
                <button
                  onClick={() => setShowCvModal(false)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  View Updated Profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={uploadingCv}
                    onClick={() => setShowCvModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!selectedCvFile || uploadingCv}
                    onClick={handleUploadAndApplyCv}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-medium text-xs px-5 py-2 rounded-xl transition-colors flex items-center space-x-2 cursor-pointer"
                  >
                    {uploadingCv ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Extract & Fill Profile</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
