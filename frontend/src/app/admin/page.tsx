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
import { Input } from '@/components/ui/input';
import { ProtectedLayout } from '@/components/protected-layout';
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  XCircle,
  FileCheck,
  History,
  Activity,
  AlertTriangle,
  AlertCircle,
  X,
  Loader2,
  RefreshCw,
  ArrowLeft,
  UserCheck,
  Scale,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t, locale } = useI18n();

  const [dashboard, setDashboard] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [legalResources, setLegalResources] = useState<any[]>([]);
  const [legalStats, setLegalStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Legal Modal & Form State
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [editingResource, setEditingResource] = useState<any | null>(null);
  const [legalFormData, setLegalFormData] = useState({
    title: '',
    description: '',
    legalReference: '',
    officialSource: '',
    category: 'CRIMINAL_LAW_VIOLENCE',
    language: 'ar',
    publishedAt: '',
    isVerified: true,
    isActive: true,
  });

  const loadAdminData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [dash, users, verifs, logs, legals] = await Promise.all([
        api.admin.getDashboard(),
        api.admin.getUsers(),
        api.admin.getVerifications(),
        api.admin.getAuditLogs(),
        api.legal.getAdminResources({ limit: 100 }).catch(() => null),
      ]);
      setDashboard(dash);
      setUsersList(users);
      setVerifications(verifs);
      setAuditLogs(logs);
      if (legals) {
        setLegalResources(legals.items || []);
        setLegalStats(legals.stats || null);
      }
    } catch (err: any) {
      setError(err?.message || (locale === 'ar' ? 'فشل تحميل بيانات الإدارة' : 'Impossible de charger les données'));
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (isAuthenticated && user?.role === 'ADMIN') {
      loadAdminData();
    }
  }, [authLoading, isAuthenticated, user, loadAdminData, router]);

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      await api.admin.updateUserStatus(userId, newStatus);
      setActionSuccess(
        locale === 'ar'
          ? `تم تحديث حالة المستخدم بنجاح إلى ${newStatus}`
          : `Statut utilisateur mis à jour vers ${newStatus}`,
      );
      loadAdminData();
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleReviewVerification = async (verificationId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await api.admin.reviewVerification(verificationId, status, 'Revue administrative effectuée');
      setActionSuccess(
        locale === 'ar'
          ? `تمت معالجة ملف التحقق (${status})`
          : `Dossier de vérification mis à jour (${status})`,
      );
      loadAdminData();
    } catch (err: any) {
      setError(err?.message || 'Erreur de validation');
    }
  };

  const handleOpenAddLegalModal = () => {
    setEditingResource(null);
    setLegalFormData({
      title: '',
      description: '',
      legalReference: '',
      officialSource: '',
      category: 'CRIMINAL_LAW_VIOLENCE',
      language: 'ar',
      publishedAt: new Date().toISOString().split('T')[0],
      isVerified: true,
      isActive: true,
    });
    setShowLegalModal(true);
  };

  const handleOpenEditLegalModal = (resource: any) => {
    setEditingResource(resource);
    setLegalFormData({
      title: resource.title || '',
      description: resource.description || '',
      legalReference: resource.legalReference || '',
      officialSource: resource.officialSource || '',
      category: resource.category || 'CRIMINAL_LAW_VIOLENCE',
      language: resource.language || 'ar',
      publishedAt: resource.publishedAt ? new Date(resource.publishedAt).toISOString().split('T')[0] : '',
      isVerified: resource.lastVerifiedAt !== null,
      isActive: resource.isActive ?? true,
    });
    setShowLegalModal(true);
  };

  const handleSaveLegalResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!legalFormData.title.trim() || !legalFormData.description.trim() || !legalFormData.legalReference.trim()) {
        setError(locale === 'ar' ? 'يرجى ملء جميع الحقول الإلزامية' : 'Veuillez remplir tous les champs obligatoires');
        return;
      }

      if (editingResource) {
        await api.legal.updateResource(editingResource.id, {
          title: legalFormData.title,
          description: legalFormData.description,
          legalReference: legalFormData.legalReference,
          officialSource: legalFormData.officialSource,
          category: legalFormData.category,
          language: legalFormData.language,
          publishedAt: legalFormData.publishedAt ? new Date(legalFormData.publishedAt).toISOString() : undefined,
          isActive: legalFormData.isActive,
          isVerified: legalFormData.isVerified,
        });
        setActionSuccess(locale === 'ar' ? 'تم تحديث المرجع القانوني بنجاح' : 'Ressource légale mise à jour');
      } else {
        await api.legal.createResource({
          title: legalFormData.title,
          description: legalFormData.description,
          legalReference: legalFormData.legalReference,
          officialSource: legalFormData.officialSource,
          category: legalFormData.category,
          language: legalFormData.language,
          publishedAt: legalFormData.publishedAt ? new Date(legalFormData.publishedAt).toISOString() : undefined,
          isVerified: legalFormData.isVerified,
        });
        setActionSuccess(locale === 'ar' ? 'تمت إضافة المرجع القانوني الجديد بنجاح' : 'Nouvelle ressource légale ajoutée');
      }

      setShowLegalModal(false);
      loadAdminData();
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de l’enregistrement de la ressource légale');
    }
  };

  const handleVerifyLegalResource = async (id: string) => {
    try {
      await api.legal.verifyResource(id);
      setActionSuccess(
        locale === 'ar'
          ? 'تم تدقيق واعتماد المرجع القانوني وتحديث تاريخ المراجعة بنجاح'
          : 'Ressource juridique certifiée et date de vérification actualisée',
      );
      loadAdminData();
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la vérification');
    }
  };

  const handleToggleLegalStatus = async (id: string) => {
    try {
      await api.legal.toggleResourceStatus(id);
      setActionSuccess(
        locale === 'ar' ? 'تم تعديل حالة تفعيل المرجع القانوني' : 'Statut de la ressource légale mis à jour',
      );
      loadAdminData();
    } catch (err: any) {
      setError(err?.message || 'Erreur lors du changement de statut');
    }
  };

  const handleDeleteLegalResource = async (id: string) => {
    const confirmMsg =
      locale === 'ar'
        ? 'هل أنتِ متأكدة من حذف هذا المرجع القانوني نهائياً ؟'
        : 'Êtes-vous sûr de vouloir supprimer définitivement cette ressource juridique ?';
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.legal.deleteResource(id);
      setActionSuccess(
        locale === 'ar' ? 'تم حذف المرجع القانوني بنجاح' : 'Ressource légale supprimée avec succès',
      );
      loadAdminData();
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la suppression');
    }
  };

  if (authLoading) {
    return (
      <ProtectedLayout allowedRoles={['ADMIN']}>
        <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#5C1F75]" />
        </div>
      </ProtectedLayout>
    );
  }

  // 403 Forbidden Access State for Non-Admin Users
  if (!user || user.role !== 'ADMIN') {
    return (
      <ProtectedLayout allowedRoles={['ADMIN']}>
        {null}
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout allowedRoles={['ADMIN']}>
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
            <ShieldAlert className="h-7 w-7 text-purple-600" />
            <span>{locale === 'ar' ? 'فضاء الإدارة والرقابة — سَنَد' : 'Supervision & Administration SANAD'}</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {locale === 'ar'
              ? 'إدارة الحسابات، مراجعة ملفات المهنيين، وتتبع أمان المنصة وفق القوانين المعمول بها.'
              : 'Gestion des utilisateurs, validation des professionnels et traçabilité des accès.'}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadAdminData}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{locale === 'ar' ? 'تحديث البيانات' : 'Actualiser'}</span>
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

      {/* Metrics Grid */}
      {dashboard && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-purple-200/80 bg-purple-50/30 dark:border-purple-900/40 dark:bg-purple-950/20">
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold uppercase text-purple-700 dark:text-purple-400">
                {locale === 'ar' ? 'إجمالي المستخدمين' : 'Total Utilisateurs'}
              </span>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span>{dashboard.totalUsers}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-500">
              Citoyennes: {dashboard.roleCounts?.USER || 0} | Avocats: {dashboard.roleCounts?.LAWYER || 0} | Psychologues: {dashboard.roleCounts?.PSYCHOLOGIST || 0}
            </CardContent>
          </Card>

          <Card className="border-emerald-200/80 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-400">
                {locale === 'ar' ? 'الجلسات النشطة' : 'Sessions Actives'}
              </span>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-600" />
                <span>{dashboard.activeSessions}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-500">
              Appareils connectés en direct
            </CardContent>
          </Card>

          <Card className="border-amber-200/80 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/20">
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold uppercase text-amber-700 dark:text-amber-400">
                {locale === 'ar' ? 'ملفات قيد التحقق' : 'Vérifications en attente'}
              </span>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-amber-600" />
                <span>{dashboard.pendingVerifications}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-500">
              Justificatifs professionnels soumis
            </CardContent>
          </Card>

          <Card className="border-blue-200/80 bg-blue-50/30 dark:border-blue-900/40 dark:bg-blue-950/20">
            <CardHeader className="pb-2">
              <span className="text-xs font-semibold uppercase text-blue-700 dark:text-blue-400">
                {locale === 'ar' ? 'سجلات الرقابة والتدقيق' : 'Journaux d’audit'}
              </span>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <History className="h-5 w-5 text-blue-600" />
                <span>{dashboard.auditLogsCount}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-500">
              Traçabilité des opérations sensibles
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            <span>{locale === 'ar' ? 'إدارة حسابات المنصة' : 'Gestion des comptes utilisateurs'}</span>
          </CardTitle>
          <CardDescription>
            {locale === 'ar' ? 'عرض الأدوار وحالة النشاط والتحكم في تعليق الحسابات' : 'Contrôle des rôles, statuts et suspensions'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-3 text-start">Utilisateur</th>
                  <th className="p-3 text-start">Rôle</th>
                  <th className="p-3 text-start">E-mail</th>
                  <th className="p-3 text-start">Statut</th>
                  <th className="p-3 text-end">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : 'Sans nom'}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px]">
                        {u.role}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {u.isEmailVerified ? (
                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Vérifié
                        </span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Non vérifié
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={u.status === 'ACTIVE' ? 'default' : 'destructive'}
                        className="text-[10px]"
                      >
                        {u.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-end">
                      <Button
                        size="sm"
                        variant={u.status === 'ACTIVE' ? 'destructive' : 'outline'}
                        className="text-xs h-7"
                        onClick={() => handleToggleUserStatus(u.id, u.status)}
                      >
                        {u.status === 'ACTIVE'
                          ? (locale === 'ar' ? 'تعليق الحساب' : 'Suspendre')
                          : (locale === 'ar' ? 'تفعيل الحساب' : 'Réactiver')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Professional Verifications Review */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-amber-600" />
            <span>{locale === 'ar' ? 'اعتماد ومراجعة المهنيين' : 'Validation des professionnels (Avocats & Psychologues)'}</span>
          </CardTitle>
          <CardDescription>
            {locale === 'ar' ? 'فحص بطاقات النقابة والدبلومات لمنح شارة المهني المعتمد' : 'Examen des diplômes et attestations d’inscription à l’Ordre'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verifications.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              {locale === 'ar' ? 'لا توجد طلبات تحقق معلقة حالياً' : 'Aucune demande de vérification en attente'}
            </p>
          ) : (
            <div className="space-y-3">
              {verifications.map((v) => (
                <div
                  key={v.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {v.professional?.user?.firstName} {v.professional?.user?.lastName}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {v.professional?.professionalType}
                      </Badge>
                      <Badge className="text-[10px]">{v.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Document : {v.documentType} — URL/Fichier : <span className="font-mono">{v.documentUrl}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                      onClick={() => handleReviewVerification(v.id, 'VERIFIED')}
                    >
                      {locale === 'ar' ? 'اعتماد' : 'Approuver'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="text-xs h-8"
                      onClick={() => handleReviewVerification(v.id, 'REJECTED')}
                    >
                      {locale === 'ar' ? 'رفض' : 'Rejeter'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ======================================================== */}
      {/* 4. LEGAL RESOURCES & STATUTES ADMINISTRATION             */}
      {/* ======================================================== */}
      <Card id="legal-resources" className="border-purple-200/80 dark:border-purple-900/40">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <Scale className="h-5 w-5 text-[#5C1F75] dark:text-[#C48CE0]" />
              <span>{t('legalModule.admin.title')}</span>
            </CardTitle>
            <CardDescription className="text-xs">
              {t('legalModule.admin.subtitle')}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/legal-resources">
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-[#5C1F75] border-purple-200 hover:bg-purple-50"
              >
                <BookOpen className="h-3.5 w-3.5 me-1" />
                <span>{locale === 'ar' ? 'معاينة البوابة العامة' : 'Voir le portail public'}</span>
              </Button>
            </Link>

            <Button
              size="sm"
              onClick={handleOpenAddLegalModal}
              className="bg-[#5C1F75] hover:bg-[#4A1663] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>{t('legalModule.admin.addBtn')}</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Legal Resources Quick Stats */}
          {legalStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <p className="text-slate-500 font-medium">{t('legalModule.admin.totalStat')}</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{legalResources.length}</p>
              </div>
              <div>
                <p className="text-emerald-600 font-medium">{t('legalModule.admin.verifiedStat')}</p>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                  {legalStats.totalVerified ?? legalResources.filter((r) => r.lastVerifiedAt !== null).length}
                </p>
              </div>
              <div>
                <p className="text-amber-600 font-medium">{t('legalModule.admin.pendingStat')}</p>
                <p className="text-lg font-bold text-amber-700 dark:text-amber-400">
                  {legalStats.totalUnverified ?? legalResources.filter((r) => r.lastVerifiedAt === null).length}
                </p>
              </div>
              <div>
                <p className="text-purple-600 font-medium">{t('legalModule.admin.activeStat')}</p>
                <p className="text-lg font-bold text-purple-700 dark:text-purple-400">
                  {legalStats.totalActive ?? legalResources.filter((r) => r.isActive).length}
                </p>
              </div>
            </div>
          )}

          {/* Table of Legal Resources */}
          {legalResources.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 space-y-2">
              <Scale className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto" />
              <p>{locale === 'ar' ? 'لا توجد نصوص قانونية مسجلة حالياً' : 'Aucune disposition légale enregistrée'}</p>
              <Button size="sm" onClick={handleOpenAddLegalModal} className="bg-[#5C1F75] text-white text-xs">
                {t('legalModule.admin.addBtn')}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-xs text-start">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="p-3 text-start">{t('legalModule.admin.tableTitle')}</th>
                    <th className="p-3 text-start">{t('legalModule.admin.tableCategory')}</th>
                    <th className="p-3 text-start">{t('legalModule.admin.tableLang')}</th>
                    <th className="p-3 text-start">{t('legalModule.admin.tableStatus')}</th>
                    <th className="p-3 text-end">{t('legalModule.admin.tableActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {legalResources.map((res) => {
                    const isVerified = res.lastVerifiedAt !== null;

                    return (
                      <tr key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        {/* Title & Reference */}
                        <td className="p-3 max-w-xs">
                          <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">{res.title}</p>
                          <p className="text-[11px] text-[#5C1F75] dark:text-[#C48CE0] font-medium">{res.legalReference}</p>
                          <p className="text-[10px] text-slate-400 truncate">{res.officialSource}</p>
                        </td>

                        {/* Category */}
                        <td className="p-3">
                          <Badge variant="outline" className="text-[10px]">
                            {res.category}
                          </Badge>
                        </td>

                        {/* Language */}
                        <td className="p-3">
                          <Badge className="text-[10px] uppercase font-mono">
                            {res.language}
                          </Badge>
                        </td>

                        {/* Verification & Certification Status */}
                        <td className="p-3">
                          {isVerified ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>{t('legalModule.admin.certifiedOn')}</span>
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(res.lastVerifiedAt).toLocaleDateString()}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px]">
                                <AlertCircle className="h-3 w-3 me-1 text-amber-600" />
                                <span>{t('legalModule.admin.notCertified')}</span>
                              </Badge>
                              <Button
                                size="sm"
                                onClick={() => handleVerifyLegalResource(res.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] h-6 px-2 rounded-md font-bold"
                              >
                                {t('legalModule.admin.certifyNow')}
                              </Button>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-end">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Toggle Active status */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleLegalStatus(res.id)}
                              className={`h-7 px-2 text-[10px] font-semibold ${
                                res.isActive
                                  ? 'text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                                  : 'text-slate-400 border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {res.isActive ? 'Actif' : 'Inactif'}
                            </Button>

                            {/* Edit Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenEditLegalModal(res)}
                              className="h-7 w-7 p-0 text-slate-600 hover:text-[#5C1F75]"
                              title="Modifier"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>

                            {/* Delete Button */}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteLegalResource(res.id)}
                              className="h-7 w-7 p-0"
                              title="Supprimer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT LEGAL RESOURCE                         */}
      {/* ======================================================== */}
      {showLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-4"
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="h-5 w-5 text-[#5C1F75]" />
                <span>
                  {editingResource
                    ? t('legalModule.admin.modalEditTitle')
                    : t('legalModule.admin.modalAddTitle')}
                </span>
              </h2>
              <button
                onClick={() => setShowLegalModal(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLegalResource} className="space-y-4 text-xs">
              {/* Title */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('legalModule.admin.inputTitle')} *
                </label>
                <Input
                  type="text"
                  required
                  value={legalFormData.title}
                  onChange={(e) => setLegalFormData({ ...legalFormData, title: e.target.value })}
                  placeholder="ex: Loi 103-13 — Lutte contre les violences faites aux femmes"
                  className="h-9 text-xs"
                />
              </div>

              {/* Reference & Source */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    {t('legalModule.admin.inputReference')} *
                  </label>
                  <Input
                    type="text"
                    required
                    value={legalFormData.legalReference}
                    onChange={(e) => setLegalFormData({ ...legalFormData, legalReference: e.target.value })}
                    placeholder="ex: Loi 103-13, Articles 1 à 5"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    {t('legalModule.admin.inputSource')} *
                  </label>
                  <Input
                    type="text"
                    required
                    value={legalFormData.officialSource}
                    onChange={(e) => setLegalFormData({ ...legalFormData, officialSource: e.target.value })}
                    placeholder="ex: Bulletin Officiel n° 6655"
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Category & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    {t('legalModule.admin.inputCategory')} *
                  </label>
                  <select
                    value={legalFormData.category}
                    onChange={(e) => setLegalFormData({ ...legalFormData, category: e.target.value })}
                    className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs font-medium"
                  >
                    <option value="CRIMINAL_LAW_VIOLENCE">CRIMINAL_LAW_VIOLENCE (Violences & Pénal)</option>
                    <option value="CIVIL_PROTECTION">CIVIL_PROTECTION (Protection civile & Éloignement)</option>
                    <option value="FAMILY_LAW">FAMILY_LAW (Droit de la famille & Moudawana)</option>
                    <option value="LEGAL_PROCEDURES">LEGAL_PROCEDURES (Aide juridictionnelle)</option>
                    <option value="HUMAN_RIGHTS">HUMAN_RIGHTS (Droits humains & CNDP)</option>
                    <option value="LABOR_DISCRIMINATION">LABOR_DISCRIMINATION (Droit du travail)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    {t('legalModule.admin.inputLanguage')} *
                  </label>
                  <select
                    value={legalFormData.language}
                    onChange={(e) => setLegalFormData({ ...legalFormData, language: e.target.value })}
                    className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs font-medium"
                  >
                    <option value="ar">العربية (ar)</option>
                    <option value="fr">Français (fr)</option>
                  </select>
                </div>
              </div>

              {/* Publication Date */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('legalModule.admin.inputPublished')}
                </label>
                <Input
                  type="date"
                  value={legalFormData.publishedAt}
                  onChange={(e) => setLegalFormData({ ...legalFormData, publishedAt: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('legalModule.admin.inputDescription')} *
                </label>
                <textarea
                  required
                  rows={5}
                  value={legalFormData.description}
                  onChange={(e) => setLegalFormData({ ...legalFormData, description: e.target.value })}
                  placeholder="Texte détaillé des dispositions, peines applicables, droits de la victime..."
                  className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs leading-relaxed"
                />
              </div>

              {/* Checkboxes: isVerified & isActive */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={legalFormData.isVerified}
                    onChange={(e) => setLegalFormData({ ...legalFormData, isVerified: e.target.checked })}
                    className="rounded text-[#5C1F75] focus:ring-[#5C1F75]"
                  />
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    {t('legalModule.admin.checkVerified')}
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={legalFormData.isActive}
                    onChange={(e) => setLegalFormData({ ...legalFormData, isActive: e.target.checked })}
                    className="rounded text-[#5C1F75] focus:ring-[#5C1F75]"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">
                    {t('legalModule.admin.checkActive')}
                  </span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLegalModal(false)}
                >
                  {t('legalModule.admin.cancelBtn')}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#5C1F75] hover:bg-[#4A1663] text-white font-bold"
                >
                  {t('legalModule.admin.saveBtn')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </ProtectedLayout>
  );
}
