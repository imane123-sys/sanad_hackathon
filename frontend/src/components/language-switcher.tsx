'use client';

import React from 'react';
import { useI18n } from '@/i18n/context';
import { Locale } from '@/i18n/config';

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="inline-flex items-center rounded-full border border-[#E4D2EE] bg-[#F7F1FA] p-0.5 text-xs font-bold dark:border-[#3E1F52] dark:bg-[#20102B]">
      <button
        type="button"
        onClick={() => setLocale('ar')}
        className={`px-3 py-1 rounded-full transition-all duration-200 cursor-pointer ${
          locale === 'ar'
            ? 'bg-[#5C1F75] text-white shadow-xs font-black'
            : 'text-[#6C5B7A] hover:text-[#5C1F75] dark:text-[#A796B5] dark:hover:text-white'
        }`}
        aria-label="التحويل إلى العربية"
      >
        العربية
      </button>
      <button
        type="button"
        onClick={() => setLocale('fr')}
        className={`px-3 py-1 rounded-full transition-all duration-200 cursor-pointer ${
          locale === 'fr'
            ? 'bg-[#5C1F75] text-white shadow-xs font-black'
            : 'text-[#6C5B7A] hover:text-[#5C1F75] dark:text-[#A796B5] dark:hover:text-white'
        }`}
        aria-label="Passer en Français"
      >
        Français
      </button>
    </div>
  );
}
