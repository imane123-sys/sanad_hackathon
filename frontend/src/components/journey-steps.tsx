'use client';

import React from 'react';
import { useI18n } from '@/i18n/context';
import { ShieldCheck, FileEdit, FolderLock, Sparkles, HeartHandshake } from 'lucide-react';

export function JourneySteps() {
  const { locale } = useI18n();

  const steps = [
    {
      step: '1',
      icon: <ShieldCheck className="h-5 w-5 text-white" />,
      color: 'bg-[#5C1F75]',
      titleAr: 'تبداي بأمان',
      titleFr: 'Démarrage sécurisé',
      descAr: 'دخول آمن وفوري مع إمكانية التصفح الخفي وزر الخروج السريع.',
      descFr: 'Accès discret avec navigation privée et sortie d’urgence immédiate.',
    },
    {
      step: '2',
      icon: <FileEdit className="h-5 w-5 text-white" />,
      color: 'bg-[#7B2FA1]',
      titleAr: 'تعبئي المعلومات',
      titleFr: 'Renseignement simple',
      descAr: 'إدخال تفاصيل واقعتك أو طلبك بسرية ودون اشتراط كشف هويتك.',
      descFr: 'Description confidentielle de votre situation ou de vos besoins.',
    },
    {
      step: '3',
      icon: <FolderLock className="h-5 w-5 text-white" />,
      color: 'bg-[#9F3EBF]',
      titleAr: 'تجمعي الأدلة',
      titleFr: 'Dépôt des preuves',
      descAr: 'حفظ الصور والوثائب والمحادثات مع توليد بصمة رقمية مشفرة SHA-256.',
      descFr: 'Sauvegarde des photos, audios et messages avec empreinte certifiée.',
    },
    {
      step: '4',
      icon: <Sparkles className="h-5 w-5 text-white" />,
      color: 'bg-[#C158D8]',
      titleAr: 'كيحلل الحالة (IA)',
      titleFr: 'Analyse intelligente',
      descAr: 'تحليل أولي بالذكاء الاصطناعي لحقوقك والخيارات المتاحة لك قانونياً.',
      descFr: 'Synthèse claire par l’IA de vos droits et démarches envisageables.',
    },
    {
      step: '5',
      icon: <HeartHandshake className="h-5 w-5 text-white" />,
      color: 'bg-[#E85943]',
      titleAr: 'كتوصلي بالمساعدة',
      titleFr: 'Accompagnement ciblé',
      descAr: 'ربط مباشر بمحاميات ومحامين، أخصائيات نفسيات ومراكز إيواء بالمغرب.',
      descFr: 'Mise en relation avec des juristes, psychologues et associations.',
    },
  ];

  return (
    <div className="py-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className="relative flex flex-col items-center p-4 rounded-2xl border border-[#EADDF3] bg-white text-center shadow-xs transition-transform duration-200 hover:-translate-y-0.5 dark:border-[#381B4B] dark:bg-[#1A0E24]"
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm mb-3 ${s.color}`}
            >
              {s.icon}
            </div>
            <span className="inline-block text-[10px] font-black uppercase tracking-wider text-[#6A2586] dark:text-[#C48CE0] mb-1">
              {locale === 'ar' ? `المرحلة ${s.step}` : `Étape ${s.step}`}
            </span>
            <h4 className="text-sm font-bold text-[#4A1663] dark:text-[#E8D1F5] mb-1">
              {locale === 'ar' ? s.titleAr : s.titleFr}
            </h4>
            <p className="text-[11px] text-[#6C5B7A] dark:text-slate-400 leading-snug">
              {locale === 'ar' ? s.descAr : s.descFr}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
