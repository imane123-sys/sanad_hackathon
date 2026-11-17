'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useI18n } from '@/i18n/context';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { RoleSidebar } from '@/components/role-sidebar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface ProtectedLayoutProps {
  allowedRoles: string[];
  children: ReactNode;
  currentTab?: string;
  onTabChange?: (tab: string) => void;
  spaceTitle?: string;
}

export function ProtectedLayout({
  allowedRoles,
  children,
  currentTab,
  onTabChange,
  spaceTitle,
}: ProtectedLayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t, locale, dir } = useI18n();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#5C1F75] dark:text-[#C48CE0]" />
        </div>
        <Footer />
      </div>
    );
  }

  // 403 Unauthorized Screen if user is not authenticated or does not have the required role
  const isAuthorized = isAuthenticated && user && allowedRoles.includes(user.role);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full shadow-lg border-rose-200 dark:border-rose-900/50">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 mb-2">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                {t('auth.unauthorizedTitle')}
              </CardTitle>
              <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                {t('auth.unauthorizedDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-center text-slate-500">
              {locale === 'ar'
                ? `دورك الحالي: ${user?.role || 'زائر غير مسجل'}. هذا الفضاء محمي ويتطلب صلاحيات محددة.`
                : `Votre rôle actuel : ${user?.role || 'Visiteur'}. Cet espace est protégé et restreint aux profils autorisés.`}
            </CardContent>
            <CardFooter className="flex justify-center pt-2">
              <Link href="/">
                <Button className="bg-[#5C1F75] hover:bg-[#4A1760] text-white">
                  {t('auth.returnHome')}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF7FC] text-[#22102E] dark:bg-[#120917] dark:text-[#F6EEFA]">
      {/* Global Top Navbar */}
      <Navbar />

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row">
        <RoleSidebar currentTab={currentTab} onTabChange={onTabChange} />

        {/* Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
