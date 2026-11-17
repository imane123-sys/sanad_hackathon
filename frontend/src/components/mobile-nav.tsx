'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useI18n } from '@/i18n/context';
import { SanadLogo } from './sanad-logo';
import { Button } from './ui/button';
import { QuickExitButton } from './quick-exit-button';
import {
  Menu,
  X,
  Home,
  PhoneCall,
  User as UserIcon,
  Laptop,
  ShieldAlert,
  Briefcase,
  Building2,
  LogIn,
  UserPlus,
  LogOut,
  Globe,
  Sparkles,
  Bot,
  Scale,
} from 'lucide-react';

interface MobileNavProps {
  onOpenEmergencyModal: () => void;
}

export function MobileNav({ onOpenEmergencyModal }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { t, locale, dir, setLocale } = useI18n();

  const handleClose = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      {/* Hamburger Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
        aria-label="Menu"
      >
        <Menu className="h-6 w-6 text-[#5C1F75] dark:text-[#C48CE0]" />
      </button>

      {/* Backdrop & Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={handleClose}
          />

          {/* Drawer container */}
          <aside
            dir={dir}
            className={`relative flex w-4/5 max-w-xs flex-col justify-between bg-white dark:bg-slate-900 shadow-2xl p-5 border-slate-200 dark:border-slate-800 ${
              dir === 'rtl' ? 'ms-auto border-s animate-in slide-in-from-right duration-200' : 'me-auto border-e animate-in slide-in-from-left duration-200'
            }`}
          >
            {/* Top section: Logo & Close */}
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <Link href="/" onClick={handleClose}>
                  <SanadLogo size="sm" showText={true} />
                </Link>
                <button
                  onClick={handleClose}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User overview if authenticated */}
              {isAuthenticated && user && (
                <div className="rounded-xl bg-[#FAF7FC] p-3 border border-[#EBDCF3] dark:bg-slate-800/60 dark:border-slate-700">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#5C1F75] text-xs font-bold text-white">
                      {(user.firstName?.[0] || '') + (user.lastName?.[0] || '') || user.email[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {user.firstName || user.fullName || user.email}
                      </p>
                      <span className="inline-block text-[10px] font-semibold text-[#5C1F75] dark:text-[#C48CE0]">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation links */}
              <nav className="space-y-1 text-sm font-medium">
                <Link
                  href="/"
                  onClick={handleClose}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-700 hover:bg-[#F4ECF9] hover:text-[#5C1F75] dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <Home className="h-4 w-4" />
                  <span>{t('nav.home')}</span>
                </Link>

                <Link
                  href="/legal-resources"
                  onClick={handleClose}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#5C1F75] bg-purple-50/60 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 font-semibold transition-colors"
                >
                  <Scale className="h-4 w-4 text-[#5C1F75] dark:text-purple-300" />
                  <span>{locale === 'ar' ? 'المقتضيات والنصوص القانونية' : 'Textes & Droits Juridiques'}</span>
                </Link>

                <Link
                  href="/ai"
                  onClick={handleClose}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#5C1F75] bg-purple-50/60 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 font-semibold transition-colors"
                >
                  <Bot className="h-4 w-4 text-[#5C1F75] dark:text-purple-300" />
                  <span>{locale === 'ar' ? 'المساعد الذكي' : 'Assistant IA'}</span>
                </Link>

                {/* Role Spaces */}
                {isAuthenticated && user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    onClick={handleClose}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 font-semibold"
                  >
                    <ShieldAlert className="h-4 w-4 text-purple-600" />
                    <span>{t('auth.adminNav')}</span>
                  </Link>
                )}

                {isAuthenticated && (user?.role === 'LAWYER' || user?.role === 'PSYCHOLOGIST') && (
                  <Link
                    href="/professional"
                    onClick={handleClose}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 font-semibold"
                  >
                    <Briefcase className="h-4 w-4 text-blue-600" />
                    <span>{t('auth.proNav')}</span>
                  </Link>
                )}

                {isAuthenticated && (user?.role === 'ASSOCIATION' || user?.role === 'HELP_CENTER') && (
                  <Link
                    href="/organization"
                    onClick={handleClose}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-amber-800 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 font-semibold"
                  >
                    <Building2 className="h-4 w-4 text-amber-600" />
                    <span>{t('auth.orgNav')}</span>
                  </Link>
                )}

                {isAuthenticated && (
                  <>
                    <Link
                      href="/profile"
                      onClick={handleClose}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-700 hover:bg-[#F4ECF9] dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <UserIcon className="h-4 w-4 text-emerald-600" />
                      <span>{t('userMenu.myProfile')}</span>
                    </Link>
                    <Link
                      href="/sessions"
                      onClick={handleClose}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-700 hover:bg-[#F4ECF9] dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <Laptop className="h-4 w-4 text-slate-500" />
                      <span>{t('userMenu.devices')}</span>
                    </Link>
                  </>
                )}
              </nav>

              {/* Hotline 1919 trigger */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    handleClose();
                    onOpenEmergencyModal();
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <PhoneCall className="h-4 w-4 text-rose-600 animate-pulse" />
                    <span>{locale === 'ar' ? 'طوارئ مجانية: 1919' : 'Urgence gratuite : 1919'}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-200/70 text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                    24/7
                  </span>
                </button>
              </div>
            </div>

            {/* Bottom section: Auth actions, Language & Quick Exit */}
            <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
              {/* Language toggle */}
              <button
                onClick={() => {
                  setLocale(locale === 'ar' ? 'fr' : 'ar');
                  handleClose();
                }}
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-500" />
                  <span>{locale === 'ar' ? 'Français (LTR)' : 'العربية (RTL)'}</span>
                </div>
                <span className="font-bold uppercase text-[10px] text-slate-400">
                  {locale === 'ar' ? 'FR' : 'عربي'}
                </span>
              </button>

              {/* Auth Buttons */}
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    handleClose();
                    logout();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 p-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-400"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t('userMenu.logout')}</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" onClick={handleClose}>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      <LogIn className="h-3.5 w-3.5 me-1.5" />
                      <span>{t('nav.login')}</span>
                    </Button>
                  </Link>
                  <Link href="/register" onClick={handleClose}>
                    <Button size="sm" className="w-full text-xs">
                      <UserPlus className="h-3.5 w-3.5 me-1.5" />
                      <span>{t('nav.register')}</span>
                    </Button>
                  </Link>
                </div>
              )}

              {/* Quick Exit in mobile drawer */}
              <div className="pt-1">
                <QuickExitButton variant="header" />
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
