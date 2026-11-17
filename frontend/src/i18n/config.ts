export type Locale = 'ar' | 'fr';
export type Direction = 'rtl' | 'ltr';

export interface LocaleConfig {
  code: Locale;
  name: string;
  nativeName: string;
  dir: Direction;
}

export const LOCALES: Record<Locale, LocaleConfig> = {
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    dir: 'rtl',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    dir: 'ltr',
  },
};

export const DEFAULT_LOCALE: Locale = 'ar';
