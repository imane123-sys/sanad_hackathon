'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/context';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EmergencyModal } from '@/components/emergency-modal';
import {
  Scale,
  ShieldCheck,
  AlertCircle,
  Search,
  BookOpen,
  Calendar,
  ExternalLink,
  PhoneCall,
  X,
  Filter,
  CheckCircle2,
  Clock,
  Briefcase,
  Bot,
  RefreshCw,
  Info,
} from 'lucide-react';

interface LegalResource {
  id: string;
  title: string;
  description: string;
  legalReference: string;
  officialSource: string;
  category: string;
  language: string;
  publishedAt: string | null;
  lastVerifiedAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoryStat {
  category: string;
  total: number;
  verified: number;
  unverified: number;
}

export default function LegalResourcesPage() {
  const { t, locale, dir } = useI18n();

  const [resources, setResources] = useState<LegalResource[]>([]);
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'unverified'>('all');

  // Detail Modal State
  const [selectedResource, setSelectedResource] = useState<LegalResource | null>(null);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [resData, catsData] = await Promise.all([
        api.legal.getResources({
          category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
          language: selectedLanguage !== 'ALL' ? selectedLanguage : undefined,
          search: search.trim() ? search.trim() : undefined,
          verificationStatus: verificationFilter !== 'all' ? verificationFilter : undefined,
          limit: 50,
        }),
        api.legal.getCategories().catch(() => []),
      ]);

      setResources(resData.items || []);
      if (catsData && catsData.length > 0) {
        setCategories(catsData);
      }
    } catch (err: any) {
      setError(
        err?.message ||
          (locale === 'ar'
            ? 'تعذر تحميل المقتضيات القانونية من الخادم. يرجى إعادة المحاولة.'
            : 'Impossible de charger les ressources juridiques.'),
      );
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedLanguage, search, verificationFilter, locale]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Translate category key
  const getCategoryLabel = (categoryKey: string): string => {
    const key = `legalModule.categories.${categoryKey}`;
    const translated = t(key);
    return translated !== key ? translated : categoryKey;
  };

  // Format date helper
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return locale === 'ar' ? 'غير محدد' : 'Non précisé';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(locale === 'ar' ? 'ar-MA' : 'fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7FC] dark:bg-[#120917] py-8 px-4 sm:px-6 transition-colors" dir={dir}>
      <div className="container mx-auto max-w-6xl space-y-8">
        {/* ======================================================== */}
        {/* HEADER HERO BANNER                                       */}
        {/* ======================================================== */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5C1F75] via-[#4A1663] to-[#2D124D] text-white p-6 sm:p-10 shadow-xl border border-purple-800/40">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-white/15 text-white backdrop-blur-md border border-white/20 px-3 py-1 text-xs font-semibold flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5 text-amber-300" />
                <span>{locale === 'ar' ? 'المملكة المغربية — مرجع قانوني رسمي' : 'Royaume du Maroc — Corpus Officiel'}</span>
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-3 py-1 text-xs font-semibold flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                <span>{locale === 'ar' ? 'مطابق للقانون 103-13 والظهائر الشريفة' : 'Conforme Loi 103-13 & Dahirs'}</span>
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {t('legalModule.title')}
            </h1>

            <p className="text-purple-100/90 text-sm sm:text-base leading-relaxed">
              {t('legalModule.subtitle')}
            </p>

            {/* Quick Actions Row */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEmergencyModalOpen(true)}
                className="bg-rose-600/90 hover:bg-rose-700 text-white border-rose-400/40 text-xs font-bold flex items-center gap-2 shadow-md transition-transform hover:scale-102"
              >
                <PhoneCall className="h-3.5 w-3.5 animate-pulse" />
                <span>{t('legalModule.urgentAssistance')}</span>
              </Button>

              <Link href="/ai">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs font-semibold flex items-center gap-2"
                >
                  <Bot className="h-3.5 w-3.5 text-purple-300" />
                  <span>{locale === 'ar' ? 'استشارة المساعد الذكي' : 'Assistant IA Juridique'}</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Decorative geometric background icon */}
          <Scale className="absolute -bottom-10 end-4 h-64 w-64 text-white/5 pointer-events-none transform -rotate-12" />
        </div>

        {/* ======================================================== */}
        {/* REASSURANCE HOTLINE BANNER                                */}
        {/* ======================================================== */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 dark:border-rose-950/60 dark:bg-rose-950/20 p-4 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-rose-900 dark:text-rose-200 shadow-2xs">
          <div className="flex items-center gap-3 text-start">
            <div className="h-9 w-9 rounded-full bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center shrink-0">
              <PhoneCall className="h-4 w-4 text-rose-600 dark:text-rose-400 animate-pulse" />
            </div>
            <p className="font-medium leading-relaxed">
              {t('legalModule.emergencyCallout') ||
                (locale === 'ar'
                  ? 'في حالة وجود خطر داهم عليكِ أو على أطفالك، اتصلي فوراً بالرقم الأخضر الوطني 1919 (مكالمة مجانية 24/7) أو الشرطة (19).'
                  : 'En cas de danger immédiat pour vous ou vos enfants, composez immédiatement le 1919 (ligne nationale gratuite 24/7) ou la police (19).')}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setEmergencyModalOpen(true)}
            className="shrink-0 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 rounded-xl shadow-xs"
          >
            {locale === 'ar' ? 'اتصال استعجالي 1919' : 'Secours d’urgence 1919'}
          </Button>
        </div>

        {/* ======================================================== */}
        {/* SEARCH & FILTERS CONTROL BAR                             */}
        {/* ======================================================== */}
        <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-5 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className={`absolute top-1/2 -translate-y-1/2 ${dir === 'rtl' ? 'right-3.5' : 'left-3.5'} h-4 w-4 text-slate-400`} />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('legalModule.searchPlaceholder')}
                className={`${dir === 'rtl' ? 'pr-10 pl-10' : 'pl-10 pr-10'} h-11 text-xs sm:text-sm rounded-xl border-slate-200 dark:border-slate-700 focus:border-[#5C1F75] focus:ring-[#5C1F75]`}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className={`absolute top-1/2 -translate-y-1/2 ${dir === 'rtl' ? 'left-3' : 'right-3'} text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1`}
                  aria-label="Effacer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Pills Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
              {/* Verification Filter */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-medium me-1 flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  <span>{t('legalModule.filterVerification')} :</span>
                </span>

                <button
                  onClick={() => setVerificationFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    verificationFilter === 'all'
                      ? 'bg-[#5C1F75] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {t('legalModule.allStatuses')}
                </button>

                <button
                  onClick={() => setVerificationFilter('verified')}
                  className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                    verificationFilter === 'verified'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{t('legalModule.verifiedOnly')}</span>
                </button>

                <button
                  onClick={() => setVerificationFilter('unverified')}
                  className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                    verificationFilter === 'unverified'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300'
                  }`}
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{t('legalModule.unverifiedOnly')}</span>
                </button>
              </div>

              {/* Language Filter */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-500 font-medium me-1">{t('legalModule.filterLanguage')} :</span>
                {['ALL', 'ar', 'fr'].map((langKey) => (
                  <button
                    key={langKey}
                    onClick={() => setSelectedLanguage(langKey)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      selectedLanguage === langKey
                        ? 'bg-purple-100 text-[#5C1F75] border border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    {langKey === 'ALL'
                      ? t('legalModule.allLanguages')
                      : langKey === 'ar'
                        ? 'العربية'
                        : 'Français'}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="pt-2 flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === 'ALL'
                    ? 'bg-[#5C1F75] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {t('legalModule.allCategories')}
              </button>

              {[
                'CRIMINAL_LAW_VIOLENCE',
                'CIVIL_PROTECTION',
                'FAMILY_LAW',
                'LEGAL_PROCEDURES',
                'HUMAN_RIGHTS',
                'LABOR_DISCRIMINATION',
              ].map((catKey) => {
                const stat = categories.find((c) => c.category === catKey);
                return (
                  <button
                    key={catKey}
                    onClick={() => setSelectedCategory(catKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      selectedCategory === catKey
                        ? 'bg-[#5C1F75] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <span>{getCategoryLabel(catKey)}</span>
                    {stat && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedCategory === catKey ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        {stat.total}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ======================================================== */}
        {/* RESULTS HEADER & COUNTER                                 */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-400 px-1">
          <div className="font-semibold flex items-center gap-2">
            <span>
              {resources.length} {t('legalModule.resultsCount')}
            </span>
            {verificationFilter !== 'all' && (
              <Badge variant="outline" className="text-[11px]">
                {verificationFilter === 'verified'
                  ? t('legalModule.verifiedOnly')
                  : t('legalModule.unverifiedOnly')}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1 text-slate-500 hover:text-[#5C1F75] transition-colors"
              title="Rafraîchir"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{locale === 'ar' ? 'تحديث' : 'Actualiser'}</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RESOURCES LIST / GRID                                    */}
        {/* ======================================================== */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 space-y-4">
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3" />
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                <div className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded-md w-full" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="border-rose-200 bg-rose-50/50 p-8 text-center text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/20 dark:text-rose-200">
            <AlertCircle className="h-10 w-10 text-rose-600 mx-auto mb-3" />
            <h3 className="text-base font-bold mb-1">{locale === 'ar' ? 'خطأ في تحميل البيانات' : 'Erreur de chargement'}</h3>
            <p className="text-xs mb-4">{error}</p>
            <Button size="sm" onClick={loadData} className="bg-[#5C1F75] hover:bg-[#4A1663] text-white">
              {locale === 'ar' ? 'إعادة المحاولة' : 'Réessayer'}
            </Button>
          </Card>
        ) : resources.length === 0 ? (
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center text-slate-600 dark:text-slate-300 space-y-4">
            <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('legalModule.emptyTitle')}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {t('legalModule.emptyDesc')}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSearch('');
                setSelectedCategory('ALL');
                setSelectedLanguage('ALL');
                setVerificationFilter('all');
              }}
              className="text-xs font-semibold"
            >
              {t('legalModule.clearFilters')}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {resources.map((item) => {
              const isVerified = item.lastVerifiedAt !== null;

              return (
                <Card
                  key={item.id}
                  className={`flex flex-col justify-between transition-all duration-200 hover:shadow-lg rounded-2xl bg-white dark:bg-slate-900 ${
                    isVerified
                      ? 'border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/50'
                      : 'border-amber-300/80 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10 hover:border-amber-500'
                  }`}
                >
                  <CardHeader className="p-5 pb-3 space-y-3">
                    {/* Top Row: Category Pill & Verification Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge
                        variant="outline"
                        className="text-[11px] font-bold border-purple-200 text-[#5C1F75] bg-purple-50 dark:border-purple-900/60 dark:text-purple-300 dark:bg-purple-950/40"
                      >
                        {getCategoryLabel(item.category)}
                      </Badge>

                      {/* CLEAR VERIFICATION DISTINCTION */}
                      {isVerified ? (
                        <div
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                          title={`${t('legalModule.lastVerifiedAt')} ${formatDate(item.lastVerifiedAt)}`}
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{t('legalModule.verifiedBadge')}</span>
                        </div>
                      ) : (
                        <div
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 animate-pulse"
                          title={t('legalModule.unverifiedNotice')}
                        >
                          <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                          <span>{t('legalModule.unverifiedBadge')}</span>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      {item.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-4 flex-1 flex flex-col justify-between">
                    {/* Description preview */}
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4">
                      {item.description}
                    </p>

                    {/* Official references box */}
                    <div className="rounded-xl border border-slate-100 bg-[#FAF7FC] p-3 text-xs space-y-2 dark:border-slate-800 dark:bg-slate-800/40">
                      <div className="flex items-start gap-2">
                        <BookOpen className="h-3.5 w-3.5 text-[#5C1F75] dark:text-[#C48CE0] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white me-1">
                            {t('legalModule.legalReference')}
                          </span>
                          <span className="text-slate-700 dark:text-slate-300">{item.legalReference}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <ExternalLink className="h-3.5 w-3.5 text-purple-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white me-1">
                            {t('legalModule.officialSource')}
                          </span>
                          <span className="text-slate-700 dark:text-slate-300">{item.officialSource}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                        {item.publishedAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{t('legalModule.publishedAt')} {formatDate(item.publishedAt)}</span>
                          </span>
                        )}

                        {isVerified && item.lastVerifiedAt && (
                          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{t('legalModule.lastVerifiedAt')} {formatDate(item.lastVerifiedAt)}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Unverified Warning notice if applicable */}
                    {!isVerified && (
                      <div className="rounded-xl bg-amber-500/10 border border-amber-300/60 p-2.5 text-[11px] text-amber-900 dark:text-amber-300 flex items-start gap-2">
                        <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                        <span>{t('legalModule.unverifiedNotice')}</span>
                      </div>
                    )}

                    {/* Bottom Action Buttons */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedResource(item)}
                        className="text-xs font-bold text-[#5C1F75] border-[#5C1F75]/30 hover:bg-[#5C1F75]/10 rounded-xl"
                      >
                        {t('legalModule.readDetails')}
                      </Button>

                      <Link href="/dashboard">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-slate-700 hover:text-[#5C1F75] font-semibold flex items-center gap-1"
                        >
                          <Briefcase className="h-3.5 w-3.5" />
                          <span>{t('legalModule.contactLawyer')}</span>
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* ======================================================== */}
        {/* DETAILED RESOURCE MODAL DIALOG                           */}
        {/* ======================================================== */}
        {selectedResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6"
              dir={dir}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedResource(null)}
                className={`absolute top-5 ${dir === 'rtl' ? 'left-5' : 'right-5'} p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition-colors`}
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Badge className="bg-[#5C1F75] text-white text-xs">
                  {getCategoryLabel(selectedResource.category)}
                </Badge>

                {selectedResource.lastVerifiedAt !== null ? (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs flex items-center gap-1 font-bold">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{t('legalModule.verifiedBadge')}</span>
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-xs flex items-center gap-1 font-bold">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                    <span>{t('legalModule.unverifiedBadge')}</span>
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug">
                {selectedResource.title}
              </h2>

              {/* Official References Bar */}
              <div className="rounded-2xl border border-purple-100 bg-[#FAF7FC] p-4 text-xs space-y-2 dark:border-purple-950 dark:bg-purple-950/20">
                <div className="flex items-start gap-2">
                  <BookOpen className="h-4 w-4 text-[#5C1F75] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {t('legalModule.legalReference')}{' '}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      {selectedResource.legalReference}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <ExternalLink className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {t('legalModule.officialSource')}{' '}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      {selectedResource.officialSource}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-purple-200/50 dark:border-purple-900/50">
                  {selectedResource.publishedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{t('legalModule.publishedAt')} {formatDate(selectedResource.publishedAt)}</span>
                    </span>
                  )}
                  {selectedResource.lastVerifiedAt && (
                    <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>{t('legalModule.lastVerifiedAt')} {formatDate(selectedResource.lastVerifiedAt)}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Full Description & Rights */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white">
                  {locale === 'ar' ? 'المقتضيات والحقوق المنصوص عليها :' : 'Dispositions et droits garantis :'}
                </h3>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {selectedResource.description}
                </div>
              </div>

              {/* Legal Aid Box Reminder */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/20 p-4 text-xs space-y-1 text-emerald-900 dark:text-emerald-200">
                <div className="flex items-center gap-2 font-bold">
                  <Scale className="h-4 w-4 text-emerald-600" />
                  <span>
                    {locale === 'ar' ? 'حق الاستفادة من المساعدة القضائية المجانية' : 'Droit à l’aide juridictionnelle gratuite'}
                  </span>
                </div>
                <p className="opacity-90 leading-relaxed text-[11px]">
                  {locale === 'ar'
                    ? 'وفق المرسوم الملكي 514-65، يحق لكل امرأة في وضعية هشاشة الحصول على محامٍ مجاني من طرف نقيب هيئة المحامين والإعفاء الكامل من الرسوم القضائية.'
                    : 'Conformément au Décret Royal 514-65, toute femme en situation de précarité a droit à la désignation gratuite d’un avocat par le Bâtonnier et à l’exonération intégrale des taxes judiciaires.'}
                </p>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedResource(null)}
                  className="rounded-xl text-xs"
                >
                  {locale === 'ar' ? 'إغلاق' : 'Fermer'}
                </Button>

                <div className="flex items-center gap-2">
                  <Link href="/dashboard">
                    <Button
                      size="sm"
                      className="bg-[#5C1F75] hover:bg-[#4A1663] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                    >
                      <Briefcase className="h-3.5 w-3.5" />
                      <span>{t('legalModule.contactLawyer')}</span>
                    </Button>
                  </Link>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedResource(null);
                      setEmergencyModalOpen(true);
                    }}
                    className="border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold rounded-xl"
                  >
                    <PhoneCall className="h-3.5 w-3.5 text-rose-600" />
                    <span>1919</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Modal */}
        <EmergencyModal
          isOpen={emergencyModalOpen}
          onClose={() => setEmergencyModalOpen(false)}
        />
      </div>
    </div>
  );
}
