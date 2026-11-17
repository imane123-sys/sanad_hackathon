'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useI18n } from '@/i18n/context';
import {
  LayoutDashboard,
  Users,
  FileCheck,
  History,
  Briefcase,
  Building2,
  User as UserIcon,
  Laptop,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  ShieldCheck,
  Scale,
  HeartHandshake,
  Menu,
} from 'lucide-react';

interface RoleSidebarProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
}

export function RoleSidebar({ currentTab, onTabChange }: RoleSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t, locale, dir } = useI18n();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;
  const CollapseIcon = dir === 'rtl'
    ? (collapsed ? ChevronLeft : ChevronRight)
    : (collapsed ? ChevronRight : ChevronLeft);

  // Configure navigation items by role
  let spaceTitle = t('userMenu.myProfile');
  let spaceIcon = UserIcon;
  let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  let badgeLabel = locale === 'ar' ? 'مستفيدة' : 'Citoyenne';

  interface NavItem {
    id: string;
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }

  let navItems: NavItem[] = [];

  if (user.role === 'ADMIN') {
    spaceTitle = t('auth.adminNav');
    spaceIcon = ShieldAlert;
    badgeColor = 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300';
    badgeLabel = locale === 'ar' ? 'مسؤول المنصة' : 'Administrateur';
    navItems = [
      { id: 'overview', label: t('sidebar.overview'), href: '/admin', icon: LayoutDashboard },
      { id: 'users', label: t('sidebar.users'), href: '/admin#users', icon: Users },
      { id: 'verifications', label: t('sidebar.verifications'), href: '/admin#verifications', icon: FileCheck },
      { id: 'legal-resources', label: locale === 'ar' ? 'المقتضيات القانونية' : 'Corpus Juridique', href: '/admin#legal-resources', icon: Scale },
      { id: 'audit', label: t('sidebar.auditLogs'), href: '/admin#audit', icon: History },
      { id: 'profile', label: t('sidebar.profile'), href: '/profile', icon: UserIcon },
    ];
  } else if (user.role === 'LAWYER' || user.role === 'PSYCHOLOGIST') {
    spaceTitle = t('auth.proNav');
    spaceIcon = user.role === 'LAWYER' ? Scale : HeartHandshake;
    badgeColor = 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300';
    badgeLabel = user.role === 'LAWYER'
      ? (locale === 'ar' ? 'محامية / محامٍ' : 'Avocat')
      : (locale === 'ar' ? 'أخصائية نفسية' : 'Psychologue');
    navItems = [
      { id: 'overview', label: t('sidebar.overview'), href: '/professional', icon: LayoutDashboard },
      { id: 'services', label: t('sidebar.myServices'), href: '/professional#services', icon: Briefcase },
      { id: 'requests', label: t('sidebar.requests'), href: '/professional#requests', icon: Users },
      { id: 'profile', label: t('sidebar.profile'), href: '/profile', icon: UserIcon },
      { id: 'sessions', label: t('sidebar.security'), href: '/sessions', icon: Laptop },
    ];
  } else if (user.role === 'ASSOCIATION' || user.role === 'HELP_CENTER') {
    spaceTitle = t('auth.orgNav');
    spaceIcon = Building2;
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300';
    badgeLabel = user.role === 'ASSOCIATION'
      ? (locale === 'ar' ? 'جمعية مساندة' : 'Association')
      : (locale === 'ar' ? 'مركز إيواء' : 'Centre d’accueil');
    navItems = [
      { id: 'overview', label: t('sidebar.overview'), href: '/organization', icon: LayoutDashboard },
      { id: 'profile-org', label: t('sidebar.orgProfile'), href: '/organization#profile', icon: Building2 },
      { id: 'requests', label: t('sidebar.requests'), href: '/organization#requests', icon: Users },
      { id: 'profile', label: t('sidebar.profile'), href: '/profile', icon: UserIcon },
      { id: 'sessions', label: t('sidebar.security'), href: '/sessions', icon: Laptop },
    ];
  } else {
    // Regular user
    spaceTitle = locale === 'ar' ? 'فضاء الأمان' : 'Espace Sécurisé';
    spaceIcon = LayoutDashboard;
    badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300';
    badgeLabel = locale === 'ar' ? 'مستفيدة' : 'Citoyenne';
    navItems = [
      { id: 'dashboard', label: locale === 'ar' ? 'لوحة الأمان' : 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
      { id: 'legal', label: locale === 'ar' ? 'المقتضيات القانونية' : 'Textes de Loi', href: '/legal-resources', icon: Scale },
      { id: 'profile', label: t('sidebar.profile'), href: '/profile', icon: UserIcon },
      { id: 'sessions', label: t('sidebar.security'), href: '/sessions', icon: Laptop },
    ];
  }

  const SpaceIconComponent = spaceIcon;

  return (
    <>
      {/* Mobile toggle bar */}
      <div className="md:hidden flex items-center justify-between p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <SpaceIconComponent className="h-5 w-5 text-[#5C1F75] dark:text-[#C48CE0]" />
          <span className="font-bold text-sm text-slate-900 dark:text-white">{spaceTitle}</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-1.5"
        >
          <Menu className="h-4 w-4" />
          <span>{locale === 'ar' ? 'القائمة' : 'Menu'}</span>
        </button>
      </div>

      {/* Sidebar Desktop & Mobile */}
      <aside
        className={`bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-all duration-200 shrink-0 ${
          dir === 'rtl' ? 'border-s md:border-s' : 'border-e md:border-e'
        } ${collapsed ? 'w-18' : 'w-64'} ${
          mobileOpen ? 'block' : 'hidden md:flex'
        } flex-col justify-between py-6 px-3 z-30`}
      >
        {/* Space Identity */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className={`flex items-center gap-3 ${collapsed ? 'justify-center w-full' : ''}`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4ECF9] text-[#5C1F75] dark:bg-purple-950/60 dark:text-purple-300 shadow-2xs">
                <SpaceIconComponent className="h-5 w-5" />
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <h2 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {spaceTitle}
                  </h2>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor} mt-0.5`}>
                    {badgeLabel}
                  </span>
                </div>
              )}
            </div>

            {/* Desktop collapse toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              title={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
            >
              <CollapseIcon className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* User mini status */}
          {!collapsed && (
            <div className="rounded-xl bg-[#FAF7FC] p-3 border border-[#EBDCF3] dark:bg-slate-800/50 dark:border-slate-800 text-xs">
              <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                {user.firstName || user.fullName || user.email}
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t('userMenu.active')}</span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab ? currentTab === item.id : pathname === item.href.split('#')[0];

              const handleClick = (e: React.MouseEvent) => {
                if (onTabChange && item.id) {
                  onTabChange(item.id);
                }
                setMobileOpen(false);
              };

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={handleClick}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#5C1F75] text-white shadow-xs dark:bg-[#7B2FA1]'
                      : 'text-slate-600 hover:bg-[#F4ECF9] hover:text-[#5C1F75] dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-white'
                  } ${collapsed ? 'justify-center px-2' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : ''}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Return to home */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <Link
            href="/"
            className={`flex items-center gap-2 rounded-xl p-2.5 text-xs text-slate-500 hover:text-[#5C1F75] dark:text-slate-400 dark:hover:text-purple-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <BackIcon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{t('sidebar.backToHome')}</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
