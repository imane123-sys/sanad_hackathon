'use client';

import React, { useState } from 'react';
import { LogOut, Info, ShieldAlert } from 'lucide-react';
import { Button } from './ui/button';
import { useI18n } from '@/i18n/context';

interface QuickExitButtonProps {
  variant?: 'header' | 'floating';
}

export function QuickExitButton({ variant = 'header' }: QuickExitButtonProps) {
  const { locale } = useI18n();
  const [showInfo, setShowInfo] = useState(false);

  const handleQuickExit = () => {
    // 1. Clear any sensitive user data from client storage
    try {
      localStorage.removeItem('sanad_access_token');
      localStorage.removeItem('sanad_user');
      sessionStorage.clear();
    } catch {
      // ignore
    }

    // 2. Immediate replacement of window location to neutral, safe page
    // Using window.location.replace prevents back-button easy return
    window.location.replace('https://www.google.com');
  };

  if (variant === 'floating') {
    return (
      <div className="fixed bottom-4 end-4 z-50 flex flex-col items-end gap-1">
        {showInfo && (
          <div className="max-w-xs rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 shadow-lg dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">
                  {locale === 'ar' ? 'تنبيه أمان وخصوصية' : 'Avertissement de sécurité'}
                </p>
                <p className="leading-relaxed">
                  {locale === 'ar'
                    ? 'هذا الزر ينقلك فوراً إلى موقع محايد وينهي جلستك. تنبيه: لا يمسح سجل المتصفح من جهازك. يُنصح باستخدام التصفح الخفي.'
                    : "Ce bouton redirige immédiatement vers un site neutre et vide votre session. Attention : il ne supprime pas l'historique du navigateur. Utilisez la navigation privée pour plus de sécurité."}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 shadow-md text-xs font-bold"
            title={locale === 'ar' ? 'معلومات الخروج السريع' : 'Informations sur la sortie rapide'}
            aria-label="Info sortie rapide"
          >
            <Info className="h-4 w-4" />
          </button>

          <Button
            variant="destructive"
            onClick={handleQuickExit}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-transform hover:scale-105"
            title={locale === 'ar' ? 'مغادرة الموقع فوراً إلى صفحة محايدة' : 'Quitter immédiatement le site'}
          >
            <LogOut className="h-4 w-4" />
            <span>{locale === 'ar' ? 'خروج سريع وآمن' : 'Sortie Rapide'}</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleQuickExit}
      className="bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1.5 shadow-sm text-xs cursor-pointer"
      title={
        locale === 'ar'
          ? 'خروج سريع: ينقلك فوراً إلى موقع محايد وينهي جلستك'
          : 'Sortie rapide : Redirige immédiatement vers un site neutre'
      }
    >
      <LogOut className="h-3.5 w-3.5" />
      <span>{locale === 'ar' ? 'خروج سريع' : 'Sortie Rapide'}</span>
    </Button>
  );
}
