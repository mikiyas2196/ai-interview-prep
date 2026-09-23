'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  UserCheck,
  Briefcase,
  PlayCircle,
  Video,
  Menu,
  X,
  BookOpen,
  Brain,
  Sliders,
  LogOut,
  Sparkles
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const bottomItems = [
    { labelKey: 'nav.dashboard', defaultLabel: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { labelKey: 'nav.profile', defaultLabel: 'Profile', href: '/profile', icon: UserCheck },
    { labelKey: 'nav.jobs', defaultLabel: 'Jobs', href: '/jobs', icon: Briefcase },
    { labelKey: 'nav.practice', defaultLabel: 'Practice', href: '/practice', icon: PlayCircle },
    { labelKey: 'nav.mock', defaultLabel: 'Mock', href: '/mock-interview', icon: Video, badge: 'AI' },
  ];

  const drawerItems = [
    { labelKey: 'nav.dashboard', defaultLabel: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { labelKey: 'nav.profile', defaultLabel: 'Candidate Profile', href: '/profile', icon: UserCheck },
    { labelKey: 'nav.jobs', defaultLabel: 'Target Jobs', href: '/jobs', icon: Briefcase },
    { labelKey: 'nav.practice', defaultLabel: 'Practice Mode', href: '/practice', icon: PlayCircle },
    { labelKey: 'nav.mock', defaultLabel: 'Mock Interview', href: '/mock-interview', icon: Video },
    { labelKey: 'nav.stories', defaultLabel: 'Story Bank', href: '/stories', icon: BookOpen },
    { labelKey: 'nav.memories', defaultLabel: 'AI Memory Settings', href: '/memories', icon: Brain },
    { labelKey: 'nav.settings', defaultLabel: 'Settings', href: '/settings', icon: Sliders },
  ];

  return (
    <>
      {/* Smartphone Slide-Over Navigation Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
                <Brain className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-100 text-base">{t('header.title', 'AI Interview Coach')}</span>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            <div className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {t('nav.platform_navigation', 'Platform Navigation')}
            </div>
            {drawerItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{t(item.labelKey, item.defaultLabel)}</span>
                </Link>
              );
            })}
          </div>

          {user && (
            <div className="p-4 border-t border-slate-800 bg-slate-900/60">
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center space-x-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('header.logout', 'Logout')}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Touch-friendly Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around md:hidden">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center px-2 py-1 rounded-xl text-[10px] font-medium transition-all relative ${
                isActive ? 'text-indigo-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 bg-emerald-500 text-slate-950 font-extrabold text-[8px] px-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="truncate max-w-[56px] text-[10px]">{t(item.labelKey, item.defaultLabel)}</span>
            </Link>
          );
        })}

        {/* Expandable Menu Toggle Button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center px-2 py-1 rounded-xl text-[10px] text-slate-400 hover:text-slate-200"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
};
