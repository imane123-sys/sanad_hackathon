'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useI18n } from '@/i18n/context';
import { SanadLogo } from '@/components/sanad-logo';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Mail, AlertCircle, CheckCircle2, Loader2, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { t, locale } = useI18n();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ message: string; resetToken?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await api.auth.forgotPassword(email);
      setResult(res);
    } catch (err: any) {
      setError(err?.message || (locale === 'ar' ? 'حدث خطأ' : 'Une erreur est survenue'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const BackIcon = locale === 'ar' ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#FAF7FC] dark:bg-[#120917]">
      <div className="w-full max-w-md space-y-4">
        {/* Top Logo Branding */}
        <div className="text-center pb-1">
          <SanadLogo size="lg" orientation="vertical" />
          <p className="text-xs font-semibold text-[#7A6A88] dark:text-[#A796B5] mt-2">
            {locale === 'ar' ? 'معاً من أجل مجتمع أكثر أماناً وتضامناً' : 'Ensemble pour une société plus sûre et plus solidaire'}
          </p>
        </div>

        <Card className="shadow-lg border-[#EADDF3] dark:border-[#381B4B]">
          <CardHeader className="text-center space-y-2 pb-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4ECF9] text-[#7B2C98] dark:bg-[#2B1038] dark:text-[#E8D1F5] mb-1">
              <Mail className="h-6 w-6 text-[#7B2C98] dark:text-[#E8D1F5]" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-[#4A1663] dark:text-[#E8D1F5]">
              {t('auth.forgotPasswordTitle')}
            </CardTitle>
            <CardDescription className="text-xs text-[#6C5B7A] dark:text-slate-400">
              {t('auth.forgotPasswordSubtitle')}
            </CardDescription>
          </CardHeader>

          {result ? (
            <CardContent className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl dark:bg-emerald-950/30 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-200 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">
                      {locale === 'ar' ? 'تم استلام طلبك' : 'Demande reçue'}
                    </h4>
                    <p className="text-xs mt-1 text-emerald-700 dark:text-emerald-300">
                      {result.message}
                    </p>
                  </div>
                </div>

                {result.resetToken && (
                  <div className="mt-4 pt-3 border-t border-emerald-200/70 dark:border-emerald-800/60 space-y-2">
                    <p className="text-xs font-medium text-emerald-900 dark:text-emerald-100">
                      {locale === 'ar'
                        ? 'رمز إعادة التعيين المباشر (وضع التطوير) :'
                        : 'Jeton de réinitialisation direct (mode développement) :'}
                    </p>
                    <code className="block p-2 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-200 dark:border-emerald-800 font-mono text-xs break-all select-all text-slate-800 dark:text-slate-200">
                      {result.resetToken}
                    </code>
                    <div className="pt-2">
                      <Link
                        href={`/reset-password?token=${encodeURIComponent(result.resetToken)}`}
                        className="w-full"
                      >
                        <Button variant="sanad" size="sm" className="w-full text-xs rounded-xl">
                          {locale === 'ar' ? 'تعيين كلمة المرور الجديدة الآن' : 'Définir un nouveau mot de passe'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-[#5C1F75] dark:text-[#E8D1F5]">
                    {t('auth.emailLabel')}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute start-3.5 top-3.5 h-4 w-4 text-[#A796B5]" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@exemple.ma"
                      className="ps-10 h-11 rounded-2xl border-[#E4D2EE] focus-visible:ring-[#7B2C98]"
                      autoComplete="email"
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 pt-2">
                <Button
                  type="submit"
                  variant="sanad"
                  size="lg"
                  className="w-full rounded-2xl h-11 text-sm font-bold shadow-md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>{locale === 'ar' ? 'جارٍ الإرسال...' : 'Envoi en cours...'}</span>
                    </>
                  ) : (
                    t('auth.sendResetLink')
                  )}
                </Button>
              </CardFooter>
            </form>
          )}

          <div className="text-center pb-6 pt-2 border-t border-[#F2E6F7] dark:border-[#2B1038] mx-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-[#7A6A88] hover:text-[#5C1F75] dark:hover:text-[#F6A035] transition-colors"
            >
              <BackIcon className="h-3.5 w-3.5" />
              <span>{t('auth.backToLogin')}</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
