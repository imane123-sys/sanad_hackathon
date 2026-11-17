'use client';

import React from 'react';
import { useI18n } from '@/i18n/context';
import { Lock, ShieldCheck, Heart } from 'lucide-react';

export function SafetyBanner() {
  const { locale } = useI18n();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4A1663] via-[#63227D] to-[#4A1663] p-4 text-white shadow-md">
      <div className="container mx-auto max-w-4xl flex items-center justify-center gap-3 text-center">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-xs">
          <Lock className="h-4 w-4 text-[#FDE047]" />
        </div>
        <p className="text-xs sm:text-sm font-semibold tracking-wide leading-relaxed">
          {locale === 'ar'
            ? 'بياناتك سرية ومحمية بالكامل، وما كيتشارك حتى معلومة إلا بموافقتك الصريحة'
            : 'Vos données sont strictement confidentielles et protégées. Aucune information n’est partagée sans votre accord préalable.'}
        </p>
      </div>
    </div>
  );
}
