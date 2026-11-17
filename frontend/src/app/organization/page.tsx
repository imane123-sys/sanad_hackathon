'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useI18n } from '@/i18n/context';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ProtectedLayout } from '@/components/protected-layout';
import {
  Building2,
  Home,
  ShieldAlert,
  CheckCircle2,
  MapPin,
  Phone,
  Clock,
  RefreshCw,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Users,
} from 'lucide-react';

export default function OrganizationPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t, locale } = useI18n();

  const [dashboard, setDashboard] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Profile form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const loadOrgData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [dash, prof, reqs] = await Promise.all([
        api.organization.getDashboard(),
        api.organization.getProfile(),
        api.organization.getRequests(),
      ]);
      setDashboard(dash);
      setProfile(prof);
      setRequests(reqs);
      if (prof?.data) {
        setName(prof.data.name || '');
        setPhone(prof.data.phone || '');
        setCity(prof.data.city || '');
      }
    } catch (err: any) {
      setError(err?.message || (locale === 'ar' ? 'فشل تحميل بيانات الهيئة' : 'Impossible de charger vos données'));
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (isAuthenticated && (user?.role === 'ASSOCIATION' || user?.role === 'HELP_CENTER')) {
      loadOrgData();
    }
  }, [authLoading, isAuthenticated, user, loadOrgData, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      await api.organization.updateProfile({ name, phone, city });
      setActionSuccess(locale === 'ar' ? 'تم تحديث معلومات الهيئة' : 'Informations de l’organisme mises à jour');
      loadOrgData();
    } catch (err: any) {
      setError(err?.message || 'Erreur de mise à jour');
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading) {
    return (
      <ProtectedLayout allowedRoles={['ASSOCIATION', 'HELP_CENTER']}>
        <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#5C1F75]" />
        </div>
      </ProtectedLayout>
    );
  }

  // 403 Forbidden Access State for Non-Organizations
  if (!user || (user.role !== 'ASSOCIATION' && user.role !== 'HELP_CENTER')) {
    return (
      <ProtectedLayout allowedRoles={['ASSOCIATION', 'HELP_CENTER']}>
        {null}
      </ProtectedLayout>
    );
  }

  const isHelpCenter = user.role === 'HELP_CENTER';

  return (
    <ProtectedLayout allowedRoles={['ASSOCIATION', 'HELP_CENTER']}>
      <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-emerald-600 inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>{t('auth.returnHome')}</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            {isHelpCenter ? <Home className="h-7 w-7 text-amber-600" /> : <Building2 className="h-7 w-7 text-emerald-600" />}
            <span>
              {isHelpCenter
                ? (locale === 'ar' ? 'فضاء مركز الاستقبال والإيواء' : 'Espace Centre d’Hébergement & Accueil')
                : (locale === 'ar' ? 'فضاء الجمعيات والتضامن' : 'Espace Association & Action Sociale')}
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {locale === 'ar'
              ? 'إدارة مرافق الاستقبال، تحديث شروط الإيواء، ومتابعة طلبات المساعدة الاجتماعية.'
              : 'Gestion des capacités d’accueil, conditions d’admission et orientation d’urgence.'}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadOrgData}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{locale === 'ar' ? 'تحديث' : 'Actualiser'}</span>
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Dashboard Stats */}
      {dashboard && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-amber-200/80 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/20">
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold uppercase text-amber-700 dark:text-amber-400">
                {locale === 'ar' ? 'نوع الهيئة' : 'Type d’organisme'}
              </span>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Badge className="bg-amber-600 text-white text-xs">
                  {dashboard.organizationType}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-500">
              Partenaire conventionné SANAD
            </CardContent>
          </Card>

          <Card className="border-emerald-200/80 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-400">
                {locale === 'ar' ? 'طلبات الدعم المجتمعي' : 'Demandes d’aide reçues'}
              </span>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                <span>{dashboard.activeRequests}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-500">
              Besoins d’écoute et d’hébergement
            </CardContent>
          </Card>

          <Card className="border-blue-200/80 bg-blue-50/30 dark:border-blue-900/40 dark:bg-blue-950/20">
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold uppercase text-blue-700 dark:text-blue-400">
                {locale === 'ar' ? 'شبكة التضامن الوطنية' : 'Réseau solidaire'}
              </span>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <span>{dashboard.networkStats?.totalAssociations + dashboard.networkStats?.totalHelpCenters}</span>
                <span className="text-xs font-normal text-slate-500">structures actives</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-500">
              {dashboard.networkStats?.totalAssociations} associations, {dashboard.networkStats?.totalHelpCenters} centres
            </CardContent>
          </Card>
        </div>
      )}

      {/* Organization Details Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-600" />
            <span>{locale === 'ar' ? 'معلومات الاتصال والاستقبال' : 'Fiche de l’établissement'}</span>
          </CardTitle>
          <CardDescription>
            {locale === 'ar'
              ? 'تحديث بيانات الموقع، الهاتف، وظروف استقبال المستفيدات'
              : 'Informations publiques d’accueil et d’hébergement d’urgence'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">{locale === 'ar' ? 'اسم الهيئة أو المركز' : 'Nom de l’organisme'}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">{locale === 'ar' ? 'المدينة' : 'Ville'}</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">{locale === 'ar' ? 'الهاتف' : 'Téléphone d’accueil'}</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={isUpdating} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
              {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
              <span>{locale === 'ar' ? 'حفظ التغييرات' : 'Enregistrer les informations'}</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Community Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            <span>{locale === 'ar' ? 'طلبات الدعم والإيواء الواردة' : 'Demandes d’assistance communautaire'}</span>
          </CardTitle>
          <CardDescription>
            {locale === 'ar'
              ? 'طلبات المرافقة الاجتماعية والإيواء الطارئ'
              : 'Femmes sollicitant un accompagnement social ou une prise en charge'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              {locale === 'ar' ? 'لا توجد طلبات معلقة حالياً' : 'Aucune demande d’assistance pour le moment'}
            </p>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-semibold text-sm">
                      {r.user?.firstName || 'Bénéficiaire'} ({r.typeAssistance})
                    </span>
                    <p className="text-slate-500 mt-0.5">{r.description || 'Orientation requise'}</p>
                  </div>
                  <Badge variant="outline">{r.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </ProtectedLayout>
  );
}
