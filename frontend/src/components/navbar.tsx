'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/context';
import { useAuth } from '@/context/auth-context';
import { LanguageSwitcher } from './language-switcher';
import { QuickExitButton } from './quick-exit-button';
import { SanadLogo } from './sanad-logo';
import { UserMenu } from './user-menu';
import { MobileNav } from './mobile-nav';
import { EmergencyModal } from './emergency-modal';
import { Button } from './ui/button';
import {
  PhoneCall,
  LogIn,
  UserPlus,
  ShieldAlert,
  Briefcase,
  Building2,
  LayoutDashboard,
  Bot,
  Scale,
} from 'lucide-react';

export function Navbar() {
  const { t, locale } = useI18n();
  const { user, isAuthenticated } = useAuth();
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/95 transition-colors">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 transition-transform hover:scale-102">
            <SanadLogo size="sm" showText={true} />
          </Link>

          {/* Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Exit Header Button */}
            <QuickExitButton variant="header" />

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Legal Resources Link */}
            <Link href="/legal-resources">
              <Button
                variant="ghost"
                size="sm"
                className="hidden lg:flex items-center gap-1.5 text-xs text-slate-700 hover:text-[#5C1F75] hover:bg-purple-50 dark:text-slate-300 font-semibold"
              >
                <Scale className="h-3.5 w-3.5 text-[#5C1F75]" />
                <span>{locale === 'ar' ? 'المقتضيات القانونية' : 'Textes de Loi'}</span>
              </Button>
            </Link>

            {/* AI Assistant Link */}
            <Link href="/ai">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex items-center gap-1.5 text-xs text-[#5C1F75] hover:bg-purple-50 dark:text-purple-300 font-semibold"
              >
                <Bot className="h-3.5 w-3.5" />
                <span>{locale === 'ar' ? 'المساعد الذكي' : 'Assistant IA'}</span>
              </Button>
            </Link>

            {/* Emergency Hotline Button (1919) */}
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/30 text-xs shadow-2xs"
              onClick={() => setEmergencyModalOpen(true)}
              title={locale === 'ar' ? 'طوارئ مجانية 1919' : 'Ligne d’urgence 1919'}
            >
              <PhoneCall className="h-3.5 w-3.5 text-rose-600 animate-pulse" />
              <span className="font-bold tracking-wider">1919</span>
            </Button>

            {/* Auth Controls */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Role-specific portal links */}
                {user?.role === 'ADMIN' && (
                  <Link href="/admin">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1.5 text-xs border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300 font-semibold"
                    >
                      <ShieldAlert className="h-3.5 w-3.5 text-purple-600" />
                      <span>{t('auth.adminNav')}</span>
                    </Button>
                  </Link>
                )}

                {(user?.role === 'LAWYER' || user?.role === 'PSYCHOLOGIST') && (
                  <Link href="/professional">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1.5 text-xs border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300 font-semibold"
                    >
                      <Briefcase className="h-3.5 w-3.5 text-blue-600" />
                      <span>{t('auth.proNav')}</span>
                    </Button>
                  </Link>
                )}

                {(user?.role === 'ASSOCIATION' || user?.role === 'HELP_CENTER') && (
                  <Link href="/organization">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1.5 text-xs border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-semibold"
                    >
                      <Building2 className="h-3.5 w-3.5 text-amber-600" />
                      <span>{t('auth.orgNav')}</span>
                    </Button>
                  </Link>
                )}

                {user?.role === 'USER' && (
                  <Link href="/dashboard">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden sm:flex items-center gap-1.5 text-xs border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{locale === 'ar' ? 'فضاء الأمان' : 'Espace Sécurisé'}</span>
                    </Button>
                  </Link>
                )}

                {/* User Dropdown Menu */}
                <UserMenu />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1.5 text-xs">
                    <LogIn className="h-3.5 w-3.5 text-slate-600" />
                    <span>{locale === 'ar' ? 'دخول' : 'Connexion'}</span>
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="flex items-center gap-1.5 text-xs">
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>{locale === 'ar' ? 'إنشاء حساب' : 'Inscription'}</span>
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Navigation Drawer Trigger */}
            <MobileNav onOpenEmergencyModal={() => setEmergencyModalOpen(true)} />
          </div>
        </div>
      </header>

      {/* Moroccan Emergency Modal */}
      <EmergencyModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
      />
    </>
  );
}
