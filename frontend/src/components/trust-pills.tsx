'use client';

import React from 'react';
import { useI18n } from '@/i18n/context';
import { ShieldCheck, Heart, Sparkles, Smartphone } from 'lucide-react';

export function TrustPills() {
  const { locale } = useI18n();

  const items = [
    {
      icon: <Heart className="h-3.5 w-3.5 text-[#E85943]" />,
      ar: 'للنساء فقط',
      fr: 'Dédié aux femmes',
      bg: 'bg-[#FFF0ED] border-[#FFD9D1] text-[#E85943]',
    },
    {
      icon: <ShieldCheck className="h-3.5 w-3.5 text-[#5C1F75]" />,
      ar: 'آمنة وسرية 100%',
      fr: '100% Sécurisé & Confidentiel',
      bg: 'bg-[#F4ECF9] border-[#E8D4F3] text-[#5C1F75]',
    },
    {
      icon: <Smartphone className="h-3.5 w-3.5 text-[#2B6CB0]" />,
      ar: 'سهلة ومجانية',
      fr: 'Simple & Gratuit',
      bg: 'bg-[#EBF8FF] border-[#BEE3F8] text-[#2B6CB0]',
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-2">
      {items.map((item, idx) => (
        <span
          key={idx}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold shadow-xs select-none ${item.bg}`}
        >
          {item.icon}
          <span>{locale === 'ar' ? item.ar : item.fr}</span>
        </span>
      ))}
    </div>
  );
}
