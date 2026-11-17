'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/context';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { SanadLogo } from '@/components/sanad-logo';
import { TrustPills } from '@/components/trust-pills';
import { FeatureCardsGrid } from '@/components/feature-card';
import { JourneySteps } from '@/components/journey-steps';
import { SafetyBanner } from '@/components/safety-banner';
import { EmergencyModal } from '@/components/emergency-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  Scale,
  Heart,
  Users,
  MapPin,
  Bot,
  FolderLock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  PhoneCall,
  EyeOff,
  Lock,
  FileText,
  AlertTriangle,
  HeartHandshake,
  Building2,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

export default function HomePage() {
  const { t, locale, dir } = useI18n();
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF7FC] text-[#22102E] dark:bg-[#120917] dark:text-[#F6EEFA] transition-colors">
      {/* Top Global Navigation */}
      <Navbar />

      {/* Main Public Landing Content */}
      <main className="flex-1 space-y-16 sm:space-y-24 pb-20">
        {/* ========================================================= */}
        {/* HERO SECTION (Matches Écran d'accueil & Bienvenue SANAD)  */}
        {/* ========================================================= */}
        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-[#EBDCF3] dark:border-[#321942] bg-gradient-to-b from-[#F5ECF9] via-[#FAF7FC] to-[#FAF7FC] dark:from-[#1D0C26] dark:via-[#120917] dark:to-[#120917]">
          {/* Subtle Moroccan geometric pattern overlay */}
          <div className="absolute inset-0 bg-moroccan-pattern pointer-events-none" />

          <div className="container relative mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-6 sm:space-y-8">
            {/* Trust Badges (§ Inspiration image: للنساء فقط / آمنة وسرية 100% / سهلة ومجانية) */}
            <TrustPills />

            {/* Slogan Pill with Heart divider */}
            <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-[#F3EAF8] border border-[#E4D2EE] text-[#5C1F75] text-xs sm:text-sm font-bold shadow-xs dark:bg-[#2B1338] dark:border-[#482061] dark:text-[#E8D1F5]">
              <Sparkles className="h-4 w-4 text-[#FF6F59]" />
              <span>
                {locale === 'ar' ? 'أنتِ لستِ وحدك ♡' : 'Parce que vous n’êtes pas seule ♡'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#4A1663] dark:text-[#F6EEFA] leading-tight max-w-4xl mx-auto">
              {locale === 'ar' ? (
                <>
                  منصة <span className="text-[#6A2586] dark:text-[#C48CE0]">سَنَد</span>.. حليفة النساء وأمانهن الدائم
                </>
              ) : (
                <>
                  <span className="text-[#6A2586] dark:text-[#C48CE0]">SANAD</span>, votre alliée pour vous informer, vous protéger et vous accompagner
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="mx-auto max-w-3xl text-base sm:text-lg text-[#6C5B7A] dark:text-slate-300 leading-relaxed font-normal">
              {locale === 'ar'
                ? 'فضاء رقمي آمن وسري بالكامل لدعم النساء بالمغرب: تنظيم الأدلة بحجية قانونية، تحليل آمن للحالة بالذكاء الاصطناعي، والولوج الفوري إلى المساعدة القانونية والنفسية وشبكة الإيواء الاستعجالي.'
                : 'Un espace bienveillant et 100% confidentiel pour préserver vos preuves avec force probante, analyser votre situation selon le droit marocain, et contacter des professionnelles qualifiées au Maroc.'}
            </p>

            {/* CTA Buttons (§ Inspiration image: Commencer / Découvrir l'application / Accès discret) */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <Link href="/register">
                <Button size="lg" className="rounded-full shadow-md text-base px-8 h-12 flex items-center gap-2.5 font-bold">
                  <span>{locale === 'ar' ? 'ابدئي الآن' : 'Commencer'}</span>
                  <ArrowIcon className="h-5 w-5" />
                </Button>
              </Link>

              <a href="#services">
                <Button size="lg" variant="sanadOutline" className="rounded-full text-base px-7 h-12 flex items-center gap-2">
                  <span>{locale === 'ar' ? 'تعرفي على الخدمات' : 'Découvrir les services'}</span>
                </Button>
              </a>

              <Link href="/login">
                <Button size="lg" variant="ghost" className="rounded-full text-sm px-5 h-12 flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900">
                  <EyeOff className="h-4 w-4" />
                  <span>{locale === 'ar' ? 'تصفح بشكل مجهول' : 'Accès discret'}</span>
                </Button>
              </Link>
            </div>

            {/* Moroccan Solidarity Card Backdrop Motif */}
            <div className="pt-6 max-w-3xl mx-auto">
              <div className="rounded-2xl border border-[#EBDCF3] bg-white/80 backdrop-blur-xs p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6C5B7A] dark:text-slate-300">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" role="img" aria-label="Maroc">🇲🇦</span>
                  <div className="text-start">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {locale === 'ar' ? 'منصة مغربية وطنية موجهة لحماية النساء' : 'Plateforme marocaine de protection et de solidarité'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {locale === 'ar' ? 'معاً من أجل مجتمع أكثر أماناً وتضامناً' : 'Ensemble pour une société plus sûre et plus solidaire'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold text-[11px] border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{locale === 'ar' ? 'مجاني 100%' : '100% Gratuit'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-semibold text-[11px] border border-purple-200">
                    <Lock className="h-3.5 w-3.5" />
                    <span>{locale === 'ar' ? 'حماية تامة' : 'Hautement Sécurisé'}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 1: 4 Core Pillars (§ Bienvenue sur SANAD image)   */}
        {/* ========================================================= */}
        <section id="services" className="container mx-auto max-w-5xl px-4 sm:px-6 scroll-mt-20">
          <div className="text-center mb-10 space-y-2">
            <Badge variant="default" className="mb-1">
              {locale === 'ar' ? 'ركائز المرافقة' : 'Nos Piliers Fondamentaux'}
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-[#4A1663] dark:text-[#E8D1F5]">
              {locale === 'ar' ? 'خدمات سَنَد لحمايتك ودعمك' : 'Les piliers d’accompagnement SANAD'}
            </h2>
            <p className="text-sm text-[#6C5B7A] dark:text-slate-400 max-w-2xl mx-auto">
              {locale === 'ar'
                ? 'مواكبة شاملة تجمع بين السرية والقانون والتضامن لحمايتك وتمكينك في كل المراحل.'
                : 'Une prise en charge globale, sécurisée et confidentielle pour vous informer, vous protéger et vous entourer.'}
            </p>
          </div>

          <FeatureCardsGrid />
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: Key Features ("شنو كيدير التطبيق ؟")             */}
        {/* ========================================================= */}
        <section id="features" className="container mx-auto max-w-5xl px-4 sm:px-6 scroll-mt-20">
          <div className="text-center mb-10 space-y-2">
            <Badge variant="coral" className="mb-1">
              {t('landing.whatWeDoTitle')}
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-[#4A1663] dark:text-[#E8D1F5]">
              {locale === 'ar' ? 'أدوات رقمية مبتكرة صممت لسلامتك' : 'Des fonctionnalités concrètes pour votre sécurité'}
            </h2>
            <p className="text-sm text-[#6C5B7A] dark:text-slate-400 max-w-2xl mx-auto">
              {t('landing.whatWeDoSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Feature 1: Evidence Vault */}
            <Card className="border-[#EBDCF3] bg-white dark:border-[#381B4B] dark:bg-[#1A0E24] shadow-xs hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start gap-4 pb-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F4ECF9] text-[#5C1F75] dark:bg-purple-950/60 dark:text-purple-300">
                  <FolderLock className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-[#4A1663] dark:text-white">
                    {t('landing.vaultTitle')}
                  </CardTitle>
                  <CardDescription className="text-xs text-[#7B2C98] dark:text-[#C48CE0] font-semibold mt-0.5">
                    {locale === 'ar' ? 'بصمة رقمية SHA-256 مشفرة' : 'Horodatage & Hash SHA-256 certifié'}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-xs text-[#6C5B7A] dark:text-slate-300 leading-relaxed space-y-3">
                <p>{t('landing.vaultDesc')}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded-md bg-[#FAF7FC] border border-[#EBDCF3] text-[10px] font-medium text-[#5C1F75]">
                    {locale === 'ar' ? 'صور ومحادثات' : 'Photos & Captures'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#FAF7FC] border border-[#EBDCF3] text-[10px] font-medium text-[#5C1F75]">
                    {locale === 'ar' ? 'تسجيلات صوتية' : 'Audios sécurisés'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#FAF7FC] border border-[#EBDCF3] text-[10px] font-medium text-[#5C1F75]">
                    {locale === 'ar' ? 'شهادات طبية ومحاضر' : 'Certificats médicaux'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2: Sovereign AI Analysis */}
            <Card className="border-[#EBDCF3] bg-white dark:border-[#381B4B] dark:bg-[#1A0E24] shadow-xs hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start gap-4 pb-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1EE] text-[#FF6F59] dark:bg-rose-950/60 dark:text-rose-300">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-[#4A1663] dark:text-white">
                    {t('landing.aiAnalysisTitle')}
                  </CardTitle>
                  <CardDescription className="text-xs text-[#E85943] dark:text-rose-400 font-semibold mt-0.5">
                    {locale === 'ar' ? 'قانون 103-13 ومدونة الأسرة' : 'Droit marocain & Loi 103-13'}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-xs text-[#6C5B7A] dark:text-slate-300 leading-relaxed space-y-3">
                <p>{t('landing.aiAnalysisDesc')}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded-md bg-[#FAF7FC] border border-[#EBDCF3] text-[10px] font-medium text-[#5C1F75]">
                    {locale === 'ar' ? 'تحليل قانوني فوري' : 'Analyse instantanée'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#FAF7FC] border border-[#EBDCF3] text-[10px] font-medium text-[#5C1F75]">
                    {locale === 'ar' ? 'احترام كامل للسرية' : '100% Confidentiel'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#FAF7FC] border border-[#EBDCF3] text-[10px] font-medium text-[#5C1F75]">
                    {locale === 'ar' ? 'خيارات الحماية المتاحة' : 'Mesures conservatoires'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3: Verified Professionals */}
            <Card className="border-[#EBDCF3] bg-white dark:border-[#381B4B] dark:bg-[#1A0E24] shadow-xs hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start gap-4 pb-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EBF8FF] text-[#2B6CB0] dark:bg-blue-950/60 dark:text-blue-300">
                  <Scale className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-[#4A1663] dark:text-white">
                    {t('landing.prosTitle')}
                  </CardTitle>
                  <CardDescription className="text-xs text-[#2B6CB0] dark:text-blue-400 font-semibold mt-0.5">
                    {locale === 'ar' ? 'محامون وأخصائيون نفسيون معتمدون' : 'Avocats au barreau & Psychologues'}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-xs text-[#6C5B7A] dark:text-slate-300 leading-relaxed space-y-3">
                <p>{t('landing.prosDesc')}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded-md bg-[#FAF7FC] border border-[#EBDCF3] text-[10px] font-medium text-[#5C1F75]">
                    {locale === 'ar' ? 'تطوعي أو بأتعاب مناسبة' : 'Bénévolat ou conventionné'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#FAF7FC] border border-[#EBDCF3] text-[10px] font-medium text-[#5C1F75]">
                    {locale === 'ar' ? 'تغطية لكافة المدن' : 'Toutes les villes du Maroc'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 4: Support Network & Shelters */}
            <Card className="border-[#EBDCF3] bg-white dark:border-[#381B4B] dark:bg-[#1A0E24] shadow-xs hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start gap-4 pb-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF5F7] text-[#D53F8C] dark:bg-pink-950/60 dark:text-pink-300">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-[#4A1663] dark:text-white">
                    {t('landing.shelterTitle')}
                  </CardTitle>
                  <CardDescription className="text-xs text-[#D53F8C] dark:text-pink-400 font-semibold mt-0.5">
                    {locale === 'ar' ? 'إيواء مستعجل وجمعيات تضامنية' : 'Hébergement d’urgence 24/7 & Écoute'}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-xs text-[#6C5B7A] dark:text-slate-300 leading-relaxed space-y-3">
                <p>{t('landing.shelterDesc')}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded-md bg-[#FAF7FC] border border-[#EBDCF3] text-[10px] font-medium text-[#5C1F75]">
                    {locale === 'ar' ? 'إيواء آمن ومحمي' : 'Mise à l’abri sécurisée'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#FAF7FC] border border-[#EBDCF3] text-[10px] font-medium text-[#5C1F75]">
                    {locale === 'ar' ? 'استماع ودعم نفسي' : 'Permanence d’écoute'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: User Journey in 5 Steps ("كيفاش خدام ؟")        */}
        {/* ========================================================= */}
        <section id="journey" className="container mx-auto max-w-5xl px-4 sm:px-6 scroll-mt-20">
          <div className="text-center mb-6 space-y-2">
            <Badge variant="default" className="mb-1">
              {locale === 'ar' ? 'كيفاش خدام التطبيق ؟' : 'Comment ça fonctionne ?'}
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-[#4A1663] dark:text-[#E8D1F5]">
              {locale === 'ar' ? 'مسار بسيط وآمن من 5 خطوات' : 'Votre parcours en 5 étapes simples et sûres'}
            </h2>
            <p className="text-xs sm:text-sm text-[#6C5B7A] dark:text-slate-400 max-w-xl mx-auto">
              {locale === 'ar'
                ? 'خطوات واضحة ترافقك من أول لحظة حتى الحصول على المساعدة والحماية المناسبة.'
                : 'De la première consultation discrète jusqu’à la prise en charge personnalisée par nos partenaires.'}
            </p>
          </div>

          <JourneySteps />
        </section>

        {/* ========================================================= */}
        {/* SECTION 4: Network of Intervenants ("الفئات اللي يقدرو يعاونوك") */}
        {/* ========================================================= */}
        <section id="network" className="container mx-auto max-w-5xl px-4 sm:px-6 scroll-mt-20">
          <Card className="border-[#EBDCF3] bg-gradient-to-br from-white via-[#FCF9FE] to-[#F7EEFA] dark:from-[#1A0E24] dark:to-[#170C20] shadow-sm">
            <CardHeader className="text-center pb-5">
              <Badge variant="coral" className="mx-auto mb-2">
                {locale === 'ar' ? 'الفئات اللي يقدرو يعاونوك' : 'Le réseau des intervenants qualifiés'}
              </Badge>
              <CardTitle className="text-2xl sm:text-3xl font-black text-[#4A1663] dark:text-white">
                {locale === 'ar' ? 'شبكة متكاملة من المتخصصين في خدمتك بالمغرب' : 'Des professionnelles à votre écoute au Maroc'}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm max-w-2xl mx-auto text-[#6C5B7A] dark:text-slate-300">
                {locale === 'ar'
                  ? 'محاميات ومحامون، أخصائيات نفسيات، جمعيات متخصصة ومراكز إيواء جاهزة لاستقبالك في كافة جهات المملكة.'
                  : 'Avocates, psychologues, associations et centres d’accueil conventionnés pour une prise en charge personnalisée.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-center">
                <div className="p-4 rounded-2xl bg-white border border-[#EBDCF3] shadow-2xs dark:bg-[#20112C] dark:border-slate-800">
                  <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-[#F4ECF9] text-[#5C1F75] mb-2.5">
                    <Scale className="h-6 w-6" />
                  </div>
                  <p className="font-bold text-sm text-[#4A1663] dark:text-white">
                    {locale === 'ar' ? 'محاميات ومحامون' : 'Avocates & Juristes'}
                  </p>
                  <p className="text-[11px] text-[#7A6A88] dark:text-slate-400 mt-1">
                    {locale === 'ar' ? 'تطوعي أو بأتعاب مناسبة' : 'Conseil, plainte & défense'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#EBDCF3] shadow-2xs dark:bg-[#20112C] dark:border-slate-800">
                  <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-[#FFF1EE] text-[#FF6F59] mb-2.5">
                    <Users className="h-6 w-6" />
                  </div>
                  <p className="font-bold text-sm text-[#4A1663] dark:text-white">
                    {locale === 'ar' ? 'جمعيات مساندة' : 'Associations'}
                  </p>
                  <p className="text-[11px] text-[#7A6A88] dark:text-slate-400 mt-1">
                    {locale === 'ar' ? 'مواكبة ميدانية وتضامن' : 'Soutien de proximité'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#EBDCF3] shadow-2xs dark:bg-[#20112C] dark:border-slate-800">
                  <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-[#FFF5F7] text-[#D53F8C] mb-2.5">
                    <Heart className="h-6 w-6" />
                  </div>
                  <p className="font-bold text-sm text-[#4A1663] dark:text-white">
                    {locale === 'ar' ? 'أخصائيات نفسيات' : 'Psychologues'}
                  </p>
                  <p className="text-[11px] text-[#7A6A88] dark:text-slate-400 mt-1">
                    {locale === 'ar' ? 'إنصات وتفريغ وعلاج' : 'Écoute & Thérapie'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#EBDCF3] shadow-2xs dark:bg-[#20112C] dark:border-slate-800">
                  <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-[#EBF8FF] text-[#2B6CB0] mb-2.5">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <p className="font-bold text-sm text-[#4A1663] dark:text-white">
                    {locale === 'ar' ? 'مراكز الإيواء' : 'Centres d’accueil'}
                  </p>
                  <p className="text-[11px] text-[#7A6A88] dark:text-slate-400 mt-1">
                    {locale === 'ar' ? 'إيواء مستعجل 24/7' : 'Hébergement d’urgence 24/7'}
                  </p>
                </div>
              </div>

              {/* Action row */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-[#EBDCF3]/80 dark:border-slate-800">
                <Link href="/register">
                  <Button size="sm" className="rounded-xl text-xs font-bold">
                    <span>{locale === 'ar' ? 'التسجيل لطلب المرافقة' : 'Demander un accompagnement'}</span>
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
                    <span>{locale === 'ar' ? 'فضاء المهنيين والجمعيات' : 'Espace Professionnels & Associations'}</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ========================================================= */}
        {/* SECTION 5: Legal Framework in Morocco                     */}
        {/* ========================================================= */}
        <section id="legal" className="container mx-auto max-w-5xl px-4 sm:px-6 scroll-mt-20">
          <div className="text-center mb-10 space-y-2">
            <Badge variant="default" className="mb-1">
              {t('landing.legalFrameworkTitle')}
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-[#4A1663] dark:text-[#E8D1F5]">
              {locale === 'ar' ? 'حقوقك مكفولة في القانون المغربي' : 'Vos droits garantis par la législation marocaine'}
            </h2>
            <p className="text-sm text-[#6C5B7A] dark:text-slate-400 max-w-2xl mx-auto">
              {t('landing.legalFrameworkSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Law 103-13 */}
            <Card className="border-[#EBDCF3] bg-white dark:border-[#381B4B] dark:bg-[#1A0E24] shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-[#5C1F75] dark:bg-purple-950/60 dark:text-purple-300 mb-2">
                  <FileText className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold text-[#4A1663] dark:text-white">
                  {t('landing.law10313')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-[#6C5B7A] dark:text-slate-300 leading-relaxed space-y-2">
                <p>{t('landing.law10313Desc')}</p>
                <div className="pt-2 text-[11px] font-semibold text-[#5C1F75] dark:text-[#C48CE0]">
                  {locale === 'ar' ? '• أوامر حماية مستعجلة وإبعاد المعتدي' : '• Ordonnances d’éloignement d’urgence'}
                </div>
              </CardContent>
            </Card>

            {/* Moudawana */}
            <Card className="border-[#EBDCF3] bg-white dark:border-[#381B4B] dark:bg-[#1A0E24] shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 mb-2">
                  <Scale className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold text-[#4A1663] dark:text-white">
                  {t('landing.moudawana')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-[#6C5B7A] dark:text-slate-300 leading-relaxed space-y-2">
                <p>{t('landing.moudawanaDesc')}</p>
                <div className="pt-2 text-[11px] font-semibold text-[#5C1F75] dark:text-[#C48CE0]">
                  {locale === 'ar' ? '• مستحقات النفقة، السكن، وحضانة الأبناء' : '• Pension, logement & garde des enfants'}
                </div>
              </CardContent>
            </Card>

            {/* Legal Aid (Aide Juridictionnelle) */}
            <Card className="border-[#EBDCF3] bg-white dark:border-[#381B4B] dark:bg-[#1A0E24] shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 mb-2">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold text-[#4A1663] dark:text-white">
                  {t('landing.legalAid')}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-[#6C5B7A] dark:text-slate-300 leading-relaxed space-y-2">
                <p>{t('landing.legalAidDesc')}</p>
                <div className="pt-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  {locale === 'ar' ? '• إعفاء كلي من المصاريف القضائية' : '• Gratuité totale des frais de justice'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Link to Full Legal Resources Module */}
          <div className="mt-6 text-center">
            <Link href="/legal-resources">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-[#5C1F75]/30 text-[#5C1F75] hover:bg-purple-50 dark:text-purple-300 dark:border-purple-800 font-bold text-xs px-6 py-2 shadow-xs transition-transform hover:scale-102"
              >
                <BookOpen className="h-4 w-4 me-2" />
                <span>
                  {locale === 'ar'
                    ? 'الاطلاع على الدليل الكامل للمقتضيات والنصوص القانونية ←'
                    : 'Accéder au répertoire complet des textes de loi marocains →'}
                </span>
              </Button>
            </Link>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 6: Emergency Resources in Morocco (24/7)          */}
        {/* ========================================================= */}
        <section id="emergency" className="container mx-auto max-w-5xl px-4 sm:px-6 scroll-mt-20">
          <div className="rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50/70 via-white to-rose-50/40 p-6 sm:p-10 shadow-sm dark:border-rose-950/60 dark:bg-slate-900/90 dark:from-rose-950/20 dark:to-slate-900">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-rose-200/80 dark:border-rose-900/40">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold dark:bg-rose-950/80 dark:text-rose-300">
                  <PhoneCall className="h-3.5 w-3.5 animate-pulse text-rose-600" />
                  <span>{locale === 'ar' ? 'طوارئ 24/7 مجانية بالمغرب' : 'Secours d’urgence 24/7 au Maroc'}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {t('landing.emergencySectionTitle')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl">
                  {t('landing.emergencySectionSubtitle')}
                </p>
              </div>

              <div className="shrink-0">
                <Button
                  onClick={() => setEmergencyModalOpen(true)}
                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-2xl shadow-md text-xs sm:text-sm px-6 h-11 font-bold flex items-center gap-2"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>{locale === 'ar' ? 'عرض تفاصيل الأرقام' : 'Consulter le guide d’urgence'}</span>
                </Button>
              </div>
            </div>

            {/* 4 Moroccan Emergency Helplines Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-6">
              {/* 1919 Hotline */}
              <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-2xs dark:bg-slate-800/80 dark:border-rose-900/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      24/7 • {locale === 'ar' ? 'مجاني' : 'Gratuit'}
                    </span>
                    <HeartHandshake className="h-4 w-4 text-rose-600" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                    {locale === 'ar' ? 'الخط الوطني لمناهضة العنف' : 'Ligne nationale d’écoute'}
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-3">
                    {locale === 'ar' ? 'استماع وتوجيه قانوني ونفسي' : 'Écoute, soutien & orientation'}
                  </p>
                </div>
                <a
                  href="tel:1919"
                  className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-transform active:scale-95"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>{locale === 'ar' ? 'اتصال بالرقم 1919' : 'Appel direct 1919'}</span>
                </a>
              </div>

              {/* 19 Police */}
              <div className="p-4 rounded-2xl bg-white border border-blue-200 shadow-2xs dark:bg-slate-800/80 dark:border-blue-900/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {locale === 'ar' ? 'وسط حضري' : 'Milieu Urbain'}
                    </span>
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                    {locale === 'ar' ? 'الشرطة الوطنية (النجدة)' : 'Police Secours'}
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-3">
                    {locale === 'ar' ? 'تدخل أمني عاجل بالمدن' : 'Intervention policière d’urgence'}
                  </p>
                </div>
                <a
                  href="tel:19"
                  className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-transform active:scale-95"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>{locale === 'ar' ? 'اتصال بالرقم 19' : 'Appel direct 19'}</span>
                </a>
              </div>

              {/* 177 Gendarmerie */}
              <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs dark:bg-slate-800/80 dark:border-emerald-900/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {locale === 'ar' ? 'وسط قروي وضواحي' : 'Milieu Rural'}
                    </span>
                    <AlertTriangle className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                    {locale === 'ar' ? 'الدرك الملكي' : 'Gendarmerie Royale'}
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-3">
                    {locale === 'ar' ? 'أمان القرى والضواحي' : 'Sécurité rurale et périphérique'}
                  </p>
                </div>
                <a
                  href="tel:177"
                  className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-transform active:scale-95"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>{locale === 'ar' ? 'اتصال بالرقم 177' : 'Appel direct 177'}</span>
                </a>
              </div>

              {/* 141 SAMU */}
              <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs dark:bg-slate-800/80 dark:border-amber-900/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      {locale === 'ar' ? 'إسعاف طبي' : 'Urgences SAMU'}
                    </span>
                    <Heart className="h-4 w-4 text-amber-600" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                    {locale === 'ar' ? 'الإسعاف والمساعدة الطبية' : 'SAMU / Urgences'}
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-3">
                    {locale === 'ar' ? 'طوارئ صحية ونقل استعجالي' : 'Transport et secours médical'}
                  </p>
                </div>
                <a
                  href="tel:141"
                  className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-transform active:scale-95"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>{locale === 'ar' ? 'اتصال بالرقم 141' : 'Appel direct 141'}</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 7: Confidentiality & Safety Principles            */}
        {/* ========================================================= */}
        <section id="confidentiality" className="container mx-auto max-w-5xl px-4 sm:px-6 scroll-mt-20">
          <SafetyBanner />
        </section>

        {/* ========================================================= */}
        {/* SECTION 8: Final Call To Action (CTA)                     */}
        {/* ========================================================= */}
        <section className="container mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-3xl bg-gradient-to-r from-[#5C1F75] via-[#6A2586] to-[#4A1663] text-white p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
            {/* Subtle overlay decorative elements */}
            <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none blur-xl" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-[#FF6F59]/10 pointer-events-none blur-xl" />

            <div className="relative space-y-3 max-w-2xl mx-auto">
              <Badge variant="coral" className="bg-[#FF6F59] text-white border-transparent">
                {locale === 'ar' ? 'أنتِ بأمان تام' : 'Votre sérénité avant tout'}
              </Badge>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                {t('landing.readyToStart')}
              </h2>
              <p className="text-xs sm:text-sm text-purple-100 leading-relaxed font-normal">
                {t('landing.readyDesc')}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link href="/register">
                <Button size="lg" className="rounded-full bg-white text-[#5C1F75] hover:bg-slate-100 font-bold px-8 h-12 text-sm sm:text-base shadow-md">
                  <span>{t('landing.createAccount')}</span>
                  <ArrowIcon className="h-4 w-4 ms-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="rounded-full border-white/60 text-white hover:bg-white/10 font-semibold px-6 h-12 text-sm sm:text-base">
                  <span>{t('landing.alreadyAccount')}</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Global Application Footer */}
      <Footer />

      {/* Moroccan Emergency Modal */}
      <EmergencyModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
      />
    </div>
  );
}
