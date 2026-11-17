'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/context';
import { SanadLogo } from './sanad-logo';
import {
  ShieldCheck,
  PhoneCall,
  Lock,
  Heart,
  Scale,
  Users,
  Building2,
  ExternalLink,
} from 'lucide-react';

export function Footer() {
  const { t, locale, dir } = useI18n();

  return (
    <footer className="border-t border-[#EBDCF3] bg-white text-[#22102E] dark:border-[#321942] dark:bg-[#120917] dark:text-[#F6EEFA] transition-colors">
      {/* Top subtle geometric line */}
      <div className="h-1 bg-gradient-to-r from-[#5C1F75] via-[#FF6F59] to-[#5C1F75]" />

      <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & CNDP Loi 09-08 compliance */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <SanadLogo size="md" showText={true} />
            </Link>
            <p className="text-xs text-[#6C5B7A] dark:text-slate-400 leading-relaxed">
              {locale === 'ar'
                ? 'منصة سَنَد الرقمية: معاً من أجل أمانكم وتضامنكم. فضاء آمن وموثوق للمرافقة القانونية والنفسية، وحماية الأدلة الرقمية بسرية تامة.'
                : 'Plateforme numérique SANAD : Ensemble pour votre sécurité et solidarité. Espace d’écoute, d’orientation et de sécurisation probatoire en toute confidentialité.'}
            </p>

            {/* CNDP / Loi 09-08 Tag */}
            <div className="rounded-xl border border-[#EBDCF3] bg-[#FAF7FC] p-3 text-[11px] text-[#5C1F75] dark:border-purple-900/40 dark:bg-purple-950/20 dark:text-purple-300 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-[#5C1F75] dark:text-[#C48CE0]" />
              <div>
                <p className="font-bold">
                  {locale === 'ar' ? 'الامتثال للقانون 09-08' : 'Conformité Loi 09-08'}
                </p>
                <p className="opacity-80 mt-0.5 leading-tight">
                  {t('footer.law0908')}
                </p>
              </div>
            </div>
          </div>

          {/* Col 2: Real application quick links */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold tracking-tight text-[#4A1663] dark:text-white uppercase">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2 text-xs text-[#6C5B7A] dark:text-slate-400">
              <li>
                <Link href="/" className="hover:text-[#5C1F75] dark:hover:text-purple-400 transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link href="/legal-resources" className="hover:text-[#5C1F75] dark:hover:text-purple-400 transition-colors font-medium">
                  {locale === 'ar' ? 'المقتضيات القانونية (103-13)' : 'Textes Juridiques (Loi 103-13)'}
                </Link>
              </li>
              <li>
                <Link href="/ai" className="hover:text-[#5C1F75] dark:hover:text-purple-400 transition-colors">
                  {locale === 'ar' ? 'المساعد الذكي' : 'Assistant IA'}
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-[#5C1F75] dark:hover:text-purple-400 transition-colors">
                  {t('userMenu.myProfile')}
                </Link>
              </li>
              <li>
                <Link href="/sessions" className="hover:text-[#5C1F75] dark:hover:text-purple-400 transition-colors">
                  {t('userMenu.devices')}
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#5C1F75] dark:hover:text-purple-400 transition-colors">
                  {t('nav.login')}
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#5C1F75] dark:hover:text-purple-400 transition-colors">
                  {t('nav.register')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Role Spaces */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold tracking-tight text-[#4A1663] dark:text-white uppercase">
              {t('footer.spaces')}
            </h3>
            <ul className="space-y-2 text-xs text-[#6C5B7A] dark:text-slate-400">
              <li>
                <Link href="/admin" className="flex items-center gap-1.5 hover:text-[#5C1F75] dark:hover:text-purple-400 transition-colors">
                  <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
                  <span>{t('auth.adminNav')}</span>
                </Link>
              </li>
              <li>
                <Link href="/professional" className="flex items-center gap-1.5 hover:text-[#5C1F75] dark:hover:text-purple-400 transition-colors">
                  <Scale className="h-3.5 w-3.5 text-blue-600" />
                  <span>{t('auth.proNav')}</span>
                </Link>
              </li>
              <li>
                <Link href="/organization" className="flex items-center gap-1.5 hover:text-[#5C1F75] dark:hover:text-purple-400 transition-colors">
                  <Building2 className="h-3.5 w-3.5 text-amber-600" />
                  <span>{t('auth.orgNav')}</span>
                </Link>
              </li>
              <li>
                <Link href="/register" className="flex items-center gap-1.5 hover:text-[#5C1F75] dark:hover:text-purple-400 transition-colors">
                  <Users className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{locale === 'ar' ? 'انضمام كمهني أو جمعية' : 'Rejoindre le réseau'}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Emergency Contacts in Morocco */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold tracking-tight text-rose-700 dark:text-rose-400 uppercase flex items-center gap-1.5">
              <PhoneCall className="h-4 w-4" />
              <span>{t('footer.emergencyTitle')}</span>
            </h3>
            <p className="text-[11px] text-[#6C5B7A] dark:text-slate-400">
              {t('footer.emergencyDesc')}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href="tel:1919"
                className="flex items-center justify-between p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 font-bold hover:scale-102 transition-transform"
              >
                <span>{locale === 'ar' ? 'خط 1919' : 'Ligne 1919'}</span>
                <span className="text-[10px] font-normal opacity-75">{locale === 'ar' ? 'استماع' : 'Écoute'}</span>
              </a>
              <a
                href="tel:19"
                className="flex items-center justify-between p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300 font-bold hover:scale-102 transition-transform"
              >
                <span>19</span>
                <span className="text-[10px] font-normal opacity-75">{locale === 'ar' ? 'شرطة' : 'Police'}</span>
              </a>
              <a
                href="tel:177"
                className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 font-bold hover:scale-102 transition-transform"
              >
                <span>177</span>
                <span className="text-[10px] font-normal opacity-75">{locale === 'ar' ? 'درك' : 'Gendarme'}</span>
              </a>
              <a
                href="tel:141"
                className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300 font-bold hover:scale-102 transition-transform"
              >
                <span>141</span>
                <span className="text-[10px] font-normal opacity-75">{locale === 'ar' ? 'إسعاف' : 'SAMU'}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#EBDCF3] dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A6A88] dark:text-slate-400">
          <div className="flex items-center gap-2">
            <SanadLogo size="sm" showText={false} />
            <p>{t('footer.rights')}</p>
          </div>

          <div className="flex items-center gap-5 font-medium">
            <Link href="/" className="hover:text-[#5C1F75] hover:underline transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link href="/" className="hover:text-[#5C1F75] hover:underline transition-colors">
              {t('footer.terms')}
            </Link>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {locale === 'ar' ? 'المملكة المغربية 🇲🇦' : 'Royaume du Maroc 🇲🇦'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
