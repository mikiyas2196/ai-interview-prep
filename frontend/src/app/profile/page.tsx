'use client';

import React, { useState } from 'react';
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
  AlertCircle
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
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <User className="w-6 h-6 text-indigo-400" /> Candidate Profile
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Maintain your professional background. The AI interviewer uses this data to customize question generation.
          </p>
        </div>

        {message && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
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
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl transition-colors flex items-center space-x-2"
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
            {/* Add Skill Form */}
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
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl px-4 py-2 transition-colors flex items-center justify-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Skill</span>
                </button>
              </div>
            </form>

            {/* Skill List */}
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
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
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
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl transition-colors"
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
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg"
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
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl transition-colors"
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
                  <button onClick={() => handleDeleteEducation(edu.id)} className="p-1.5 text-slate-500 hover:text-rose-400">
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
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl transition-colors"
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
                  <button onClick={() => handleDeleteProject(proj.id)} className="p-1.5 text-slate-500 hover:text-rose-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
