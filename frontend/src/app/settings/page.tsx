'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { api } from '@/services/api';
import { Sliders, Brain, Volume2, Sparkles, CheckCircle, Save, Globe } from 'lucide-react';
import { Language } from '@/i18n/translations';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [memoryEnabled, setMemoryEnabled] = useState(user?.settings?.memory_enabled ?? true);
  const [voiceEnabled, setVoiceEnabled] = useState(user?.settings?.voice_enabled ?? false);
  const [immediateFeedback, setImmediateFeedback] = useState(user?.settings?.immediate_feedback ?? true);
  const [aiModel, setAiModel] = useState(user?.settings?.preferred_ai_model ?? 'gemini-2.5-flash');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    (user?.settings?.preferred_language as Language) || language || 'en'
  );
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.settings?.preferred_language) {
      setSelectedLanguage(user.settings.preferred_language as Language);
    }
  }, [user?.settings?.preferred_language]);

  const handleLanguageChange = (newLang: Language) => {
    setSelectedLanguage(newLang);
    setLanguage(newLang);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await api.put('/settings', {
        memory_enabled: memoryEnabled,
        voice_enabled: voiceEnabled,
        immediate_feedback: immediateFeedback,
        preferred_ai_model: aiModel,
        preferred_language: selectedLanguage,
      });
      setLanguage(selectedLanguage);
      await refreshUser();
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-indigo-400" /> {t('settings.title', 'Platform Settings')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t(
              'settings.subtitle',
              'Configure AI interview coach behavior, long-term memory permissions, language preferences, and evaluation settings.'
            )}
          </p>
        </div>

        {success && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{t('settings.success', 'Preferences saved successfully!')}</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Language Selection Card */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center space-x-3 text-slate-100 font-bold text-base">
              <Globe className="w-5 h-5 text-indigo-400" />
              <span>{t('settings.lang.title', 'Language Settings / የቋንቋ ቅንብሮች')}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('settings.lang.desc', 'Select your preferred application interface and AI response language.')}
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                {t('settings.lang.label', 'Preferred Platform & AI Language')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleLanguageChange('en')}
                  className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedLanguage === 'en'
                      ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-md shadow-indigo-600/10'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-sm">English</div>
                    <div className="text-xs text-slate-400">Default interface & standard evaluation</div>
                  </div>
                  {selectedLanguage === 'en' && <CheckCircle className="w-5 h-5 text-indigo-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleLanguageChange('am')}
                  className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedLanguage === 'am'
                      ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-md shadow-indigo-600/10'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-sm">አማርኛ (Amharic)</div>
                    <div className="text-xs text-slate-400">የአማርኛ መተግበሪያ እና የኤአይ ምላሾች</div>
                  </div>
                  {selectedLanguage === 'am' && <CheckCircle className="w-5 h-5 text-indigo-400" />}
                </button>
              </div>
            </div>
          </div>

          {/* AI Memory Control */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center space-x-3 text-slate-100 font-bold text-base">
              <Brain className="w-5 h-5 text-indigo-400" />
              <span>{t('settings.memory.title', 'Personalized AI Memory')}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t(
                'settings.memory.desc',
                'When enabled, the platform extracts key strengths, weak technical areas, and communication habits from your mock interviews to personalize future preparation sessions.'
              )}
            </p>

            <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <div>
                <div className="font-semibold text-sm text-slate-200">
                  {t('settings.memory.enable_label', 'Enable Long-Term Candidate Memory')}
                </div>
                <div className="text-xs text-slate-400">
                  {t('settings.memory.enable_sub', 'Allows AI to recall historical performance and target weak areas')}
                </div>
              </div>
              <input
                type="checkbox"
                checked={memoryEnabled}
                onChange={(e) => setMemoryEnabled(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Feedback & Coaching Mode */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center space-x-3 text-slate-100 font-bold text-base">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>{t('settings.coach.title', 'Interview Coaching Mode')}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <div>
                <div className="font-semibold text-sm text-slate-200">
                  {t('settings.coach.immediate_label', 'Immediate Answer Feedback')}
                </div>
                <div className="text-xs text-slate-400">
                  {t('settings.coach.immediate_sub', 'Show breakdown & score after every question in Practice Mode')}
                </div>
              </div>
              <input
                type="checkbox"
                checked={immediateFeedback}
                onChange={(e) => setImmediateFeedback(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                {t('settings.coach.model_label', 'Preferred AI Engine Model')}
              </label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="gemini-2.5-flash">Google Gemini 2.5 Flash (Fast & Recommended)</option>
                <option value="gemini-2.5-pro">Google Gemini 2.5 Pro (Deep Technical Analysis)</option>
                <option value="gpt-4o">OpenAI GPT-4o (Alternative Provider)</option>
              </select>
            </div>
          </div>

          {/* Voice Integration Ready */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center space-x-3 text-slate-100 font-bold text-base">
              <Volume2 className="w-5 h-5 text-indigo-400" />
              <span>{t('settings.voice.title', 'Voice Interview Settings (Future Phase)')}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl opacity-80">
              <div>
                <div className="font-semibold text-sm text-slate-200">
                  {t('settings.voice.enable_label', 'Enable Speech-to-Text Voice Answering')}
                </div>
                <div className="text-xs text-slate-400">
                  {t('settings.voice.enable_sub', 'Submit mock interview responses using your microphone')}
                </div>
              </div>
              <input
                type="checkbox"
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
                className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-2.5 rounded-xl transition-colors flex items-center space-x-2 shadow-lg shadow-indigo-600/20"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? t('settings.saving', 'Saving...') : t('settings.save', 'Save Settings')}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
