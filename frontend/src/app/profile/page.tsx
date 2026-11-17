'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useI18n } from '@/i18n/context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProtectedLayout } from '@/components/protected-layout';
import {
  User as UserIcon,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Laptop,
  LogOut,
  Globe,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, refreshProfile } = useAuth();
  const { t, locale } = useI18n();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'LAWYER':
        return locale === 'ar' ? 'محامية / محامٍ' : 'Avocate / Avocat';
      case 'PSYCHOLOGIST':
        return locale === 'ar' ? 'أخصائية / أخصائي نفسي' : 'Psychologue';
      case 'ADMIN':
        return locale === 'ar' ? 'مسؤول المنصة' : 'Administrateur';
      case 'USER':
      default:
        return locale === 'ar' ? 'مستفيدة' : 'Citoyenne / Utilisatrice';
    }
  };

  return (
    <ProtectedLayout allowedRoles={['USER', 'ADMIN', 'LAWYER', 'PSYCHOLOGIST', 'ASSOCIATION', 'HELP_CENTER']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('auth.profileTitle')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t('auth.profileSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/sessions">
              <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs border-[#E4D2EE]">
                <Laptop className="h-4 w-4 text-[#5C1F75]" />
                <span>{locale === 'ar' ? 'إدارة الأجهزة والجلسات' : 'Gérer mes appareils'}</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <LogOut className="h-4 w-4" />
              <span>{locale === 'ar' ? 'تسجيل الخروج' : 'Déconnexion'}</span>
            </Button>
          </div>
        </div>

        {/* Profile Details Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Identity overview card */}
          <Card className="md:col-span-1 shadow-sm border-[#EADDF3] dark:border-[#381B4B] flex flex-col justify-between">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F4ECF9] text-[#5C1F75] dark:bg-[#2B1338] dark:text-[#E8D1F5] mb-3 shadow-inner">
                <UserIcon className="h-10 w-10" />
              </div>
              <CardTitle className="text-lg font-bold">
                {user.firstName || user.lastName
                  ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                  : locale === 'ar'
                  ? 'مستفيدة سند'
                  : 'Utilisatrice SANAD'}
              </CardTitle>
              <div className="pt-2 flex justify-center">
                <Badge variant="sanad" className="text-xs">
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-0 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 p-4">
              <div className="flex items-center justify-between">
                <span>{locale === 'ar' ? 'حالة الحساب' : 'Statut du compte'}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {locale === 'ar' ? 'نشط' : 'Actif'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{locale === 'ar' ? 'معرف المستخدم' : 'Identifiant'}</span>
                <span className="font-mono text-[10px] text-slate-500 truncate max-w-[120px]">
                  {user.id}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Detailed attributes card */}
          <Card className="md:col-span-2 shadow-sm border-[#EADDF3] dark:border-[#381B4B]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#5C1F75]" />
                <span>{locale === 'ar' ? 'المعلومات الشخصية والأمان' : 'Informations personnelles & Sécurité'}</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Email row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-white dark:bg-slate-800 text-slate-500 shadow-xs">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('auth.emailLabel')}</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{user.email}</p>
                  </div>
                </div>

                <div>
                  {user.isEmailVerified ? (
                    <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{t('auth.emailVerified')}</span>
                    </Badge>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        <span>{t('auth.emailNotVerified')}</span>
                      </Badge>
                      <Link href="/verify-email">
                        <Button size="sm" variant="ghost" className="text-xs text-emerald-600 underline p-0 h-auto">
                          {t('auth.verifyEmailNow')}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Phone row */}
              <div className="flex items-center p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 gap-3">
                <div className="p-2 rounded-md bg-white dark:bg-slate-800 text-slate-500 shadow-xs">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('auth.phoneLabel')}</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {user.phone || (locale === 'ar' ? 'غير محدد (سري)' : 'Non renseigné (confidentiel)')}
                  </p>
                </div>
              </div>

              {/* Language row */}
              <div className="flex items-center p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 gap-3">
                <div className="p-2 rounded-md bg-white dark:bg-slate-800 text-slate-500 shadow-xs">
                  <Globe className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('auth.preferredLanguageLabel')}</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {user.preferredLanguage === 'ar' ? 'العربية (RTL)' : 'Français'}
                  </p>
                </div>
              </div>

              {/* Security info alert */}
              <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <p className="font-medium">
                    {locale === 'ar' ? 'حماية إضافية لحسابك' : 'Sécurité renforcée de votre compte'}
                  </p>
                  <p className="mt-0.5 text-amber-700 dark:text-amber-400">
                    {locale === 'ar'
                      ? 'يمكنك فحص قائمة الأجهزة المتصلة بحسابك وإلغاء أي جلسة مشبوهة فوراً من صفحة إدارة الجلسات.'
                      : 'Vous pouvez surveiller vos appareils connectés et révoquer instantanément les sessions inactives ou non reconnues.'}
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 p-4">
              <Link href="/sessions">
                <Button variant="sanad" className="text-xs">
                  {locale === 'ar' ? 'عرض الأجهزة المتصلة' : 'Voir les appareils connectés'}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </ProtectedLayout>
  );
}
