'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useI18n } from '@/i18n/context';
import {
  User as UserIcon,
  Laptop,
  ShieldAlert,
  Briefcase,
  Building2,
  LogOut,
  ChevronDown,
  Globe,
  ShieldCheck,
  LayoutDashboard,
} from 'lucide-react';

export function UserMenu() {
  const { user, logout } = useAuth();
  const { t, locale, dir, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const initials =
    (user.firstName?.[0] || '') + (user.lastName?.[0] || '') ||
    user.email?.[0]?.toUpperCase() ||
    'S';

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return locale === 'ar' ? 'مسؤول المنصة' : 'Administrateur';
      case 'LAWYER':
        return locale === 'ar' ? 'محامية / محامٍ' : 'Avocat';
      case 'PSYCHOLOGIST':
        return locale === 'ar' ? 'أخصائية نفسية' : 'Psychologue';
      case 'ASSOCIATION':
        return locale === 'ar' ? 'جمعية مساندة' : 'Association';
      case 'HELP_CENTER':
        return locale === 'ar' ? 'مركز إيواء' : 'Centre d’accueil';
      case 'USER':
      default:
        return locale === 'ar' ? 'مستفيدة' : 'Citoyenne';
    }
  };

  const roleBadgeColors: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200',
    LAWYER: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200',
    PSYCHOLOGIST: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200',
    ASSOCIATION: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200',
    HELP_CENTER: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200',
    USER: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200',
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-[#EBDCF3] bg-white py-1 ps-1.5 pe-3 text-xs font-medium text-slate-700 shadow-2xs transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/80 focus:outline-hidden"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5C1F75] font-bold text-white text-[11px] shadow-xs">
          {initials}
        </div>
        <span className="hidden sm:inline max-w-[120px] truncate font-medium">
          {user.firstName || user.fullName || user.email.split('@')[0]}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute ${
            dir === 'rtl' ? 'left-0' : 'right-0'
          } mt-2 w-64 origin-top rounded-2xl border border-slate-200/90 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* User Info Header */}
          <div className="rounded-xl bg-[#FAF7FC] p-3 dark:bg-slate-800/50 mb-1 border border-[#EBDCF3]/60 dark:border-slate-800">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                {user.firstName || user.lastName
                  ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                  : user.email}
              </p>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  roleBadgeColors[user.role] || roleBadgeColors.USER
                }`}
              >
                {getRoleDisplayName(user.role)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
          </div>

          {/* Links list */}
          <div className="space-y-0.5 py-1 text-xs">
            {/* Dashboard Link for User */}
            {user.role === 'USER' && (
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-emerald-800 font-semibold hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 text-emerald-600" />
                <span>{locale === 'ar' ? 'فضاء الأمان الشخصي' : 'Mon Espace Sécurisé'}</span>
              </Link>
            )}

            {/* Role specific portals */}
            {user.role === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-purple-700 font-semibold hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-950/40 transition-colors"
              >
                <ShieldAlert className="h-4 w-4 text-purple-600" />
                <span>{t('auth.adminNav')}</span>
              </Link>
            )}

            {(user.role === 'LAWYER' || user.role === 'PSYCHOLOGIST') && (
              <Link
                href="/professional"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-blue-700 font-semibold hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/40 transition-colors"
              >
                <Briefcase className="h-4 w-4 text-blue-600" />
                <span>{t('auth.proNav')}</span>
              </Link>
            )}

            {(user.role === 'ASSOCIATION' || user.role === 'HELP_CENTER') && (
              <Link
                href="/organization"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-amber-800 font-semibold hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950/40 transition-colors"
              >
                <Building2 className="h-4 w-4 text-amber-600" />
                <span>{t('auth.orgNav')}</span>
              </Link>
            )}

            {/* Standard Profile & Devices links */}
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <UserIcon className="h-4 w-4 text-emerald-600" />
              <span>{t('userMenu.myProfile')}</span>
            </Link>

            <Link
              href="/sessions"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <Laptop className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span>{t('userMenu.devices')}</span>
            </Link>

            {/* Language Switch Option inside menu */}
            <button
              onClick={() => {
                setLocale(locale === 'ar' ? 'fr' : 'ar');
                setIsOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Globe className="h-4 w-4 text-slate-500" />
                <span>{locale === 'ar' ? 'تغيير إلى الفرنسية' : 'Passer à l’Arabe'}</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {locale === 'ar' ? 'FR' : 'عربي'}
              </span>
            </button>
          </div>

          {/* Logout Action */}
          <div className="mt-1 border-t border-slate-100 dark:border-slate-800 pt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>{t('userMenu.logout')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
