'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import {
  LayoutDashboard,
  UserCheck,
  Briefcase,
  PlayCircle,
  Video,
  BookOpen,
  Brain,
  Sliders,
  ChevronRight
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { labelKey: 'nav.dashboard', defaultLabel: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { labelKey: 'nav.profile', defaultLabel: 'Candidate Profile', href: '/profile', icon: UserCheck },
    { labelKey: 'nav.jobs', defaultLabel: 'Target Jobs', href: '/jobs', icon: Briefcase },
    { labelKey: 'nav.practice', defaultLabel: 'Practice Mode', href: '/practice', icon: PlayCircle },
    { labelKey: 'nav.mock', defaultLabel: 'Mock Interview', href: '/mock-interview', icon: Video, badgeKey: 'nav.badge.ai_live', defaultBadge: 'AI Live' },
    { labelKey: 'nav.stories', defaultLabel: 'Story Bank', href: '/stories', icon: BookOpen },
    { labelKey: 'nav.memories', defaultLabel: 'AI Memory Settings', href: '/memories', icon: Brain },
    { labelKey: 'nav.settings', defaultLabel: 'Settings', href: '/settings', icon: Sliders },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/90 text-slate-300 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          {t('nav.platform_navigation', 'Platform Navigation')}
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            const translatedLabel = t(item.labelKey, item.defaultLabel);
            const translatedBadge = item.badgeKey ? t(item.badgeKey, item.defaultBadge) : null;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{translatedLabel}</span>
                </div>
                {translatedBadge ? (
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {translatedBadge}
                  </span>
                ) : (
                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100' : ''}`} />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800/80">
        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-xs">
          <div className="flex items-center justify-between text-slate-200 font-semibold mb-1">
            <span>Memory Engine</span>
            <span className="text-emerald-400 font-mono text-[10px]">{t('common.active', 'ACTIVE')}</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            {t('header.subtitle', 'Continuously personalizing practice based on your history.')}
          </p>
        </div>
      </div>
    </aside>
  );
};
