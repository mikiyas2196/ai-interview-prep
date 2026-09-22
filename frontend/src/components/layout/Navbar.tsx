'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { User, LogOut, Brain, Sparkles, Settings, Globe } from 'lucide-react';
import Link from 'next/link';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'am' : 'en';
    setLanguage(nextLang);
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <div className="bg-indigo-600/20 p-2 rounded-lg border border-indigo-500/30 text-indigo-400">
          <Brain className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-slate-100 text-sm md:text-base flex items-center gap-2">
            {t('header.title', 'AI Interview Coach')}
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3" /> {t('header.memory_active', 'Memory Active')}
            </span>
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">
            {user?.profile?.professional_headline || t('header.subtitle', 'Personalized Preparation Engine')}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Quick Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:border-slate-700 text-xs transition-colors"
          title="Switch Language / ቋንቋ ቀይር"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-medium">{language === 'en' ? 'EN' : 'አማ'}</span>
        </button>

        {user ? (
          <div className="flex items-center space-x-3">
            <Link
              href="/settings"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              title={t('nav.settings', 'Settings')}
            >
              <Settings className="w-5 h-5" />
            </Link>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-slate-200">{user.name}</div>
                <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{user.email}</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              title={t('header.logout', 'Logout')}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3 text-sm">
            <Link href="/login" className="text-slate-300 hover:text-white transition-colors">
              {t('header.sign_in', 'Sign In')}
            </Link>
            <Link
              href="/register"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              {t('header.get_started', 'Get Started')}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
