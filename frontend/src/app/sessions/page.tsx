'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useI18n } from '@/i18n/context';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProtectedLayout } from '@/components/protected-layout';
import {
  Laptop,
  Smartphone,
  ShieldAlert,
  ShieldCheck,
  LogOut,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  Loader2,
  ArrowLeft,
} from 'lucide-react';

interface SessionItem {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  status: string;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export default function SessionsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logoutAll } = useAuth();
  const { t, locale } = useI18n();

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.auth.getSessions();
      setSessions(data);
    } catch (err: any) {
      setError(err?.message || (locale === 'ar' ? 'فشل تحميل الجلسات' : 'Impossible de charger les sessions'));
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (isAuthenticated) {
      loadSessions();
    }
  }, [authLoading, isAuthenticated, loadSessions, router]);

  const handleRevokeSingle = async (sessionId: string) => {
    try {
      setRevokingId(sessionId);
      setError(null);
      setActionSuccess(null);
      const res = await api.auth.revokeSession(sessionId);
      setActionSuccess(res.message);
      await loadSessions();
    } catch (err: any) {
      setError(err?.message || (locale === 'ar' ? 'فشل إنهاء الجلسة' : 'Échec de la révocation'));
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAll = async () => {
    if (
      !confirm(
        locale === 'ar'
          ? 'هل أنتِ متأكدة من رغبتك في تسجيل الخروج من جميع الأجهزة؟ سيتطلب ذلك تسجيل الدخول مجدداً.'
          : 'Êtes-vous sûre de vouloir déconnecter tous vos appareils ? Vous devrez vous reconnecter.',
      )
    ) {
      return;
    }

    try {
      setRevokingAll(true);
      setError(null);
      await logoutAll();
      router.push('/login');
    } catch (err: any) {
      setError(err?.message || (locale === 'ar' ? 'فشل تسجيل الخروج من جميع الأجهزة' : 'Échec de la déconnexion globale'));
      setRevokingAll(false);
    }
  };

  const parseDeviceType = (ua: string) => {
    const isMobile = /mobile|android|iphone|ipad/i.test(ua);
    return isMobile ? 'mobile' : 'desktop';
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString(locale === 'ar' ? 'ar-MA' : 'fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return isoString;
    }
  };

  if (authLoading || (loading && sessions.length === 0)) {
    return (
      <ProtectedLayout allowedRoles={['USER', 'ADMIN', 'LAWYER', 'PSYCHOLOGIST', 'ASSOCIATION', 'HELP_CENTER']}>
        <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#5C1F75]" />
        </div>
      </ProtectedLayout>
    );
  }

  const activeSessions = sessions.filter((s) => s.status === 'ACTIVE');
  const pastSessions = sessions.filter((s) => s.status !== 'ACTIVE');

  return (
    <ProtectedLayout allowedRoles={['USER', 'ADMIN', 'LAWYER', 'PSYCHOLOGIST', 'ASSOCIATION', 'HELP_CENTER']}>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/profile"
                className="text-xs text-slate-500 hover:text-emerald-600 dark:text-slate-400 inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>{locale === 'ar' ? 'العودة للملف الشخصي' : 'Retour au profil'}</span>
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('auth.sessionsTitle')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t('auth.sessionsSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadSessions}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs"
              title="Rafraîchir"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{locale === 'ar' ? 'تحديث' : 'Actualiser'}</span>
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleRevokeAll}
              disabled={revokingAll}
              className="flex items-center gap-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              {revokingAll ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogOut className="h-3.5 w-3.5" />
              )}
              <span>{t('auth.revokeAll')}</span>
            </Button>
          </div>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="flex items-center gap-2 p-3.5 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {actionSuccess && (
          <div className="flex items-center gap-2 p-3.5 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Security Rule Information §4.1 */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
            <span>{locale === 'ar' ? 'سياسة أمان الجلسات (SANAD §4.1)' : 'Politique de sécurité des sessions (SANAD §4.1)'}</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-amber-800/90 dark:text-amber-300/90 ps-1">
            <li>
              {locale === 'ar'
                ? 'تنتهي صلاحية الجلسات غير النشطة تلقائياً بعد فترة زمنية لضمان عدم بقاء الحساب مفتوحاً على أجهزة مشتركة.'
                : 'Les sessions inactives expirent automatiquement pour éviter les accès non autorisés sur des appareils partagés.'}
            </li>
            <li>
              {locale === 'ar'
                ? 'عند تغيير أو إعادة تعيين كلمة المرور، يتم إلغاء وتجريد جميع الجلسات النشطة فوراً لحمايتك.'
                : 'Lors de la modification ou réinitialisation du mot de passe, toutes les sessions actives sont révoquées immédiatement.'}
            </li>
            <li>
              {locale === 'ar'
                ? 'زر الخروج السريع في الأعلى يتيح لك مغادرة المنصة فوراً عند الطوارئ والتوجه إلى صفحة محايدة.'
                : 'Le bouton de sortie rapide en haut vous permet de quitter la plateforme immédiatement vers une page neutre en cas de risque.'}
            </li>
          </ul>
        </div>

        {/* Active Sessions List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#5C1F75]" />
            <span>{t('auth.activeSessions')}</span>
            <Badge variant="outline" className="text-xs ms-1">
              {activeSessions.length}
            </Badge>
          </h2>

          <div className="space-y-3">
            {activeSessions.map((session) => {
              const deviceType = parseDeviceType(session.deviceInfo);
              return (
                <Card
                  key={session.id}
                  className={`border transition-shadow hover:shadow-md ${
                    session.isCurrent
                      ? 'border-[#6A2586] bg-[#F4ECF9]/30 dark:bg-[#2B1338]/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`p-2.5 rounded-xl mt-0.5 shrink-0 ${
                          session.isCurrent
                            ? 'bg-[#5C1F75] text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {deviceType === 'mobile' ? (
                          <Smartphone className="h-5 w-5" />
                        ) : (
                          <Laptop className="h-5 w-5" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900 dark:text-white">
                            {session.deviceInfo.length > 50
                              ? `${session.deviceInfo.substring(0, 50)}...`
                              : session.deviceInfo}
                          </span>
                          {session.isCurrent && (
                            <Badge className="bg-[#5C1F75] hover:bg-[#4A1663] text-white text-[10px] py-0 px-2">
                              {t('auth.currentDevice')}
                            </Badge>
                          )}
                          <Badge variant="outline" className="border-[#E4D2EE] text-[#5C1F75] bg-[#F4ECF9] dark:bg-[#2B1338]/40 text-[10px] py-0">
                            {session.status}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1 font-mono">
                            <MapPin className="h-3 w-3" />
                            {session.ipAddress || 'IP masquée'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {t('auth.lastActivity')}: {formatDate(session.lastActivityAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="sm:self-center shrink-0">
                      {session.isCurrent ? (
                        <span className="text-xs text-[#5C1F75] dark:text-[#E8D1F5] font-semibold px-2.5 py-1 bg-[#F4ECF9] dark:bg-[#2B1338] rounded-full">
                          {locale === 'ar' ? 'جلسة حالية نشطة' : 'Session courante'}
                        </span>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeSingle(session.id)}
                          disabled={revokingId === session.id}
                          className="w-full sm:w-auto text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900/50"
                        >
                          {revokingId === session.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                          ) : (
                            <LogOut className="h-3.5 w-3.5 mr-1" />
                          )}
                          <span>{t('auth.revokeCurrent')}</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Past / Revoked Sessions List */}
        {pastSessions.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {locale === 'ar' ? 'الجلسات المنتهية أو الملغاة حديثاً' : 'Sessions expirées ou révoquées'}
            </h3>

            <div className="space-y-2 opacity-75">
              {pastSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Laptop className="h-4 w-4 text-slate-400" />
                    <div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {session.deviceInfo.length > 40
                          ? `${session.deviceInfo.substring(0, 40)}...`
                          : session.deviceInfo}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 ms-2">
                        {session.ipAddress}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">
                      {formatDate(session.lastActivityAt)}
                    </span>
                    <Badge variant="secondary" className="text-[10px] py-0">
                      {session.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
