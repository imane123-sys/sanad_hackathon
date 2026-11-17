'use client';

import React from 'react';
import { useI18n } from '@/i18n/context';
import { Button } from '@/components/ui/button';
import { PhoneCall, ShieldAlert, X, HeartHandshake, Ambulance, Shield } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmergencyModal({ isOpen, onClose }: EmergencyModalProps) {
  const { t, locale, dir } = useI18n();

  if (!isOpen) return null;

  const emergencyContacts = [
    {
      number: '1919',
      title: t('emergencyModal.hotline1919'),
      description: t('emergencyModal.hotline1919Desc'),
      icon: HeartHandshake,
      badge: '24/7 • Gratuit',
      badgeAr: '24/7 • مجاني',
      color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
      btnColor: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
    {
      number: '19',
      title: t('emergencyModal.police19'),
      description: t('emergencyModal.police19Desc'),
      icon: Shield,
      badge: 'Urbain • Police',
      badgeAr: 'حضري • الشرطة',
      color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
      btnColor: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    {
      number: '177',
      title: t('emergencyModal.gendarmerie177'),
      description: t('emergencyModal.gendarmerie177Desc'),
      icon: ShieldAlert,
      badge: 'Rural • Gendarmerie',
      badgeAr: 'قروي • الدرك',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      btnColor: 'bg-emerald-700 hover:bg-emerald-800 text-white',
    },
    {
      number: '141',
      title: t('emergencyModal.samu141'),
      description: t('emergencyModal.samu141Desc'),
      icon: Ambulance,
      badge: 'Médical • SAMU',
      badgeAr: 'طبي • الإسعاف',
      color: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
      btnColor: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-modal-title"
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5"
        onClick={(e) => e.stopPropagation()}
        dir={dir}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <PhoneCall className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h2 id="emergency-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                {t('emergencyModal.title')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('emergencyModal.subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            aria-label={t('emergencyModal.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Safety Banner */}
        <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-800 dark:bg-rose-950/30 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/40 flex items-center gap-2.5">
          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
          <p className="font-medium">{t('emergencyModal.safetyAdvice')}</p>
        </div>

        {/* Contacts List */}
        <div className="space-y-2.5">
          {emergencyContacts.map((contact) => {
            const Icon = contact.icon;
            return (
              <div
                key={contact.number}
                className={`flex items-center justify-between p-3.5 rounded-xl border ${contact.color} transition-all hover:shadow-xs`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/80 dark:bg-slate-800/80 shadow-2xs">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm tracking-tight">{contact.title}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/70 dark:bg-slate-800/70 border border-current/20">
                        {locale === 'ar' ? contact.badgeAr : contact.badge}
                      </span>
                    </div>
                    <p className="text-xs opacity-85 truncate mt-0.5">{contact.description}</p>
                  </div>
                </div>

                <a
                  href={`tel:${contact.number}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs shadow-xs transition-transform active:scale-95 shrink-0 ${contact.btnColor}`}
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>{contact.number}</span>
                </a>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            {t('emergencyModal.close')}
          </Button>
        </div>
      </div>
    </div>
  );
}
