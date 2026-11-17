'use client';

import React from 'react';
import { useI18n } from '@/i18n/context';
import { ShieldCheck, Scale, Heart, Users } from 'lucide-react';

export interface FeatureCardProps {
  icon: React.ReactNode;
  iconBg?: string;
  title: string;
  description: string;
  badge?: string;
  tags?: string[];
}

export function FeatureCard({
  icon,
  iconBg = 'bg-[#F4ECF9] dark:bg-[#341743]',
  title,
  description,
  badge,
  tags,
}: FeatureCardProps) {
  return (
    <div className="group relative rounded-2xl border border-[#EADDF3] bg-white p-5 text-center shadow-[0_4px_20px_-2px_rgba(92,31,117,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#6A2586] hover:shadow-[0_8px_30px_rgba(92,31,117,0.12)] dark:border-[#381B4B] dark:bg-[#1A0E24]">
      {badge && (
        <span className="absolute top-3 end-3 rounded-full bg-[#FAF0DC] text-[#B7791F] px-2 py-0.5 text-[10px] font-bold">
          {badge}
        </span>
      )}
      <div
        className={`mx-auto mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${iconBg}`}
      >
        {icon}
      </div>
      <h3 className="text-base font-bold text-[#4A1663] dark:text-[#E8D1F5] mb-1.5">
        {title}
      </h3>
      <p className="text-xs text-[#6C5B7A] dark:text-slate-400 leading-relaxed mb-2">
        {description}
      </p>
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5 pt-2 border-t border-[#F4ECF9] dark:border-[#2B1038]">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="rounded-full bg-[#FAF7FC] text-[#5C1F75] px-2 py-0.5 text-[10px] font-medium border border-[#EADDF3] dark:bg-[#251233] dark:text-[#E8D1F5] dark:border-[#3E1F52]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface FeatureCardItem {
  icon: React.ReactNode;
  iconBg: string;
  titleAr: string;
  titleFr: string;
  descAr: string;
  descFr: string;
}

export function FeatureCardsGrid() {
  const { locale } = useI18n();

  const features: FeatureCardItem[] = [
    {
      icon: <ShieldCheck className="h-6 w-6 text-[#5C1F75]" />,
      iconBg: 'bg-[#F4ECF9] dark:bg-[#341743]',
      titleAr: 'الحماية والسرية التامة',
      titleFr: 'Protection & Confidentialité',
      descAr: 'حفظ الأدلة والوثائق في خزانة مشفرة تضمن حمايتك وسريتك.',
      descFr: 'Conservation sécurisée et chiffrée de vos preuves et documents.',
    },
    {
      icon: <Scale className="h-6 w-6 text-[#2B6CB0]" />,
      iconBg: 'bg-[#EBF8FF] dark:bg-[#1A2D42]',
      titleAr: 'استشارات قانونية موثوقة',
      titleFr: 'Conseils juridiques fiables',
      descAr: 'فهم دقيق لحقوقك وفق القانون المغربي مع محاميات ومحامين مختصين.',
      descFr: 'Compréhension claire de vos droits selon le droit marocain.',
    },
    {
      icon: <Heart className="h-6 w-6 text-[#D53F8C]" />,
      iconBg: 'bg-[#FFF5F7] dark:bg-[#3D1426]',
      titleAr: 'مواكبة ودعم نفسي',
      titleFr: 'Soutien psychologique',
      descAr: 'جلسات استماع وتوجيه مهني مع أخصائيات نفسيات في فضاء مطمئن.',
      descFr: 'Accompagnement bienveillant et confidentiel par des psychologues.',
    },
    {
      icon: <Users className="h-6 w-6 text-[#DD6B20]" />,
      iconBg: 'bg-[#FFFAF0] dark:bg-[#3B250F]',
      titleAr: 'شبكة التضامن بالمغرب',
      titleFr: 'Réseau d’aide au Maroc',
      descAr: 'ربط مباشر مع الجمعيات ومراكز الإيواء والمساعدة الطارئة.',
      descFr: 'Orientation vers les associations et centres d’accueil partenaires.',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {features.map((f, i) => (
        <FeatureCard
          key={i}
          icon={f.icon}
          iconBg={f.iconBg}
          title={locale === 'ar' ? f.titleAr : f.titleFr}
          description={locale === 'ar' ? f.descAr : f.descFr}
        />
      ))}
    </div>
  );
}
