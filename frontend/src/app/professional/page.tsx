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
  Briefcase,
  Scale,
  HeartHandshake,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  FileText,
} from 'lucide-react';

export default function ProfessionalPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t, locale } = useI18n();

  const [dashboard, setDashboard] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // New service form state
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('0');
  const [isSubmittingService, setIsSubmittingService] = useState(false);

  const loadProData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [dash, serv, reqs] = await Promise.all([
        api.professional.getDashboard(),
        api.professional.getServices(),
        api.professional.getRequests(),
      ]);
      setDashboard(dash);
      setServices(serv);
      setRequests(reqs);
    } catch (err: any) {
      setError(err?.message || (locale === 'ar' ? 'فشل تحميل بيانات المهني' : 'Impossible de charger vos données'));
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (isAuthenticated && (user?.role === 'LAWYER' || user?.role === 'PSYCHOLOGIST')) {
      loadProData();
    }
  }, [authLoading, isAuthenticated, user, loadProData, router]);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName) return;

    try {
      setIsSubmittingService(true);
      await api.professional.createService({
        name: serviceName,
        serviceType: user?.role === 'LAWYER' ? 'LEGAL_REPRESENTATION' : 'PSYCHOLOGICAL_SUPPORT',
        price: parseFloat(servicePrice) || 0,
        currency: 'MAD',
      });
      setServiceName('');
      setServicePrice('0');
      setActionSuccess(locale === 'ar' ? 'تمت إضافة الخدمة بنجاح' : 'Prestation ajoutée avec succès');
      loadProData();
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la création du service');
    } finally {
      setIsSubmittingService(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, status: string) => {
    try {
      await api.professional.updateRequestStatus(requestId, status, 'Mise à jour par le professionnel');
      setActionSuccess(locale === 'ar' ? 'تم تحديث حالة الملف' : 'Statut du dossier mis à jour');
      loadProData();
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la mise à jour du statut');
    }
  };

  if (authLoading) {
    return (
      <ProtectedLayout allowedRoles={['LAWYER', 'PSYCHOLOGIST']}>
        <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#5C1F75]" />
        </div>
      </ProtectedLayout>
    );
  }

  // 403 Forbidden Access State for Non-Professionals
  if (!user || (user.role !== 'LAWYER' && user.role !== 'PSYCHOLOGIST')) {
    return (
      <ProtectedLayout allowedRoles={['LAWYER', 'PSYCHOLOGIST']}>
        {null}
      </ProtectedLayout>
    );
  }

  const isLawyer = user.role === 'LAWYER';

  return (
    <ProtectedLayout allowedRoles={['LAWYER', 'PSYCHOLOGIST']}>
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
            {isLawyer ? <Scale className="h-7 w-7 text-blue-600" /> : <HeartHandshake className="h-7 w-7 text-teal-600" />}
            <span>
              {isLawyer
                ? (locale === 'ar' ? 'فضاء المحاماة والاستشارة القانونية' : 'Espace Avocat & Conseil Juridique')
                : (locale === 'ar' ? 'فضاء المواكبة النفسية والدعم' : 'Espace Psychologue & Soutien')}
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {locale === 'ar'
              ? 'معالجة ملفات المواكبة، إدارة الخدمات والأسعار، واستقبال المواعيد بكل سرية.'
              : 'Gestion des demandes d’accompagnement, tarification et suivi sécurisé des dossiers.'}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadProData}
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

      {/* Dashboard Summary */}
      {dashboard && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-blue-200/80 bg-blue-50/30 dark:border-blue-900/40 dark:bg-blue-950/20">
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold uppercase text-blue-700 dark:text-blue-400">
                {locale === 'ar' ? 'حالة الاعتماد الرسمي' : 'Statut de validation'}
              </span>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Badge className="bg-emerald-600 text-white text-xs">
                  {dashboard.verificationStatus}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-500">
              {dashboard.specialty} — {dashboard.city}
            </CardContent>
          </Card>

          <Card className="border-emerald-200/80 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-400">
                {locale === 'ar' ? 'الملفات الموجهة إليك' : 'Dossiers assignés'}
              </span>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-emerald-600" />
                <span>{dashboard.assignedRequestsCount}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-500">
              Demandes d’assistance directe
            </CardContent>
          </Card>

          <Card className="border-purple-200/80 bg-purple-50/30 dark:border-purple-900/40 dark:bg-purple-950/20">
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold uppercase text-purple-700 dark:text-purple-400">
                {locale === 'ar' ? 'الخدمات المعروضة' : 'Prestations actives'}
              </span>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <span>{dashboard.servicesCount}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-500">
              Formules et tarifs configurés
            </CardContent>
          </Card>
        </div>
      )}

      {/* Services Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            <span>{locale === 'ar' ? 'الخدمات والتعريفات المعروضة' : 'Mes services & tarifs'}</span>
          </CardTitle>
          <CardDescription>
            {locale === 'ar'
              ? 'حدد جلسات الاستماع أو الترافع ومستويات الأتعاب أو المواكبة المجانية'
              : 'Définissez vos prestations de conseil, consultation ou accompagnement pro bono'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleCreateService} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder={locale === 'ar' ? 'اسم الخدمة (مثال: استشارة قانونية أولية)' : 'Nom du service (ex: Première consultation)'}
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                required
              />
            </div>
            <div className="w-full sm:w-36">
              <Input
                type="number"
                placeholder="Prix (MAD)"
                value={servicePrice}
                onChange={(e) => setServicePrice(e.target.value)}
                min="0"
              />
            </div>
            <Button type="submit" disabled={isSubmittingService} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
              <Plus className="h-4 w-4 mr-1" />
              <span>{locale === 'ar' ? 'إضافة خدمة' : 'Ajouter'}</span>
            </Button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {services.map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-sm">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.serviceType}</p>
                </div>
                <div className="text-end">
                  <span className="font-bold text-sm text-emerald-600">
                    {s.price === '0.00' || s.price === 0 ? 'Gratuit / Pro bono' : `${s.price} ${s.currency}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assigned Assistance Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-600" />
            <span>{locale === 'ar' ? 'ملفات المواكبة وطلبات المساعدة' : 'Demandes d’assistance reçues'}</span>
          </CardTitle>
          <CardDescription>
            {locale === 'ar' ? 'متابعة وتحديث حالات الملفات الموكلة إليك' : 'Traitement et mise à jour de l’état des demandes'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              {locale === 'ar' ? 'لا توجد طلبات جديدة موجهة إليك في الوقت الحالي' : 'Aucune demande d’assistance assignée pour le moment'}
            </p>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {r.user?.firstName || 'Bénéficiaire'} {r.user?.lastName || ''}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {r.typeAssistance}
                      </Badge>
                      <Badge className="text-[10px]">{r.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {r.description || 'Demande d’orientation'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-emerald-600 hover:bg-emerald-50 h-8"
                      onClick={() => handleUpdateStatus(r.id, 'ACCEPTEE')}
                    >
                      Accepter
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-blue-600 hover:bg-blue-50 h-8"
                      onClick={() => handleUpdateStatus(r.id, 'TERMINEE')}
                    >
                      Terminer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-rose-600 hover:bg-rose-50 h-8"
                      onClick={() => handleUpdateStatus(r.id, 'REFUSEE')}
                    >
                      Refuser
                    </Button>
                  </div>
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
