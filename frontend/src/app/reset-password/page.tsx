'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useI18n } from '@/i18n/context';
import { SanadLogo } from '@/components/sanad-logo';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useI18n();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    const passwordRegex = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
    if (newPassword.length < 8 || !passwordRegex.test(newPassword)) {
      setError(t('auth.passwordRequirement'));
      return;
    }

    setIsSubmitting(true);

    try {
      await api.auth.resetPassword({ token, newPassword });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.message || (locale === 'ar' ? 'فشل إعادة تعيين كلمة المرور' : 'Échec de la réinitialisation'));
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
              <KeyRound className="h-6 w-6 text-[#7B2C98] dark:text-[#E8D1F5]" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-[#4A1663] dark:text-[#E8D1F5]">
              {t('auth.resetPasswordTitle')}
            </CardTitle>
            <CardDescription className="text-xs text-[#6C5B7A] dark:text-slate-400">
              {t('auth.resetPasswordSubtitle')}
            </CardDescription>
          </CardHeader>

          {isSuccess ? (
            <CardContent className="space-y-4 pt-2">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl dark:bg-emerald-950/30 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-200 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">
                      {locale === 'ar' ? 'تم تحديث كلمة المرور بنجاح' : 'Mot de passe mis à jour avec succès'}
                    </h4>
                    <p className="text-xs mt-1 text-emerald-700 dark:text-emerald-300">
                      {t('auth.securityNotice')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/login">
                  <Button variant="sanad" className="w-full rounded-2xl h-11 text-sm font-bold shadow-md">
                    {t('auth.loginButton')}
                  </Button>
                </Link>
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

                {/* Security info box */}
                <div className="flex items-start gap-2.5 p-3 text-xs text-[#5C1F75] bg-[#F4ECF9] border border-[#EADDF3] rounded-2xl dark:bg-[#2B1038] dark:border-[#4A1663] dark:text-[#E8D1F5]">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-[#FF6F59]" />
                  <span>{t('auth.securityNotice')}</span>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="token" className="text-xs font-semibold text-[#5C1F75] dark:text-[#E8D1F5]">
                    {t('auth.resetTokenLabel')}
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute start-3.5 top-3.5 h-4 w-4 text-[#A796B5]" />
                    <Input
                      id="token"
                      type="text"
                      required
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Jeton de réinitialisation"
                      className="ps-10 h-11 rounded-2xl border-[#E4D2EE] font-mono text-xs focus-visible:ring-[#7B2C98]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-xs font-semibold text-[#5C1F75] dark:text-[#E8D1F5]">
                    {t('auth.newPasswordLabel')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute start-3.5 top-3.5 h-4 w-4 text-[#A796B5]" />
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="ps-10 pe-10 h-11 rounded-2xl border-[#E4D2EE] focus-visible:ring-[#7B2C98]"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3.5 top-3.5 text-[#A796B5] hover:text-[#5C1F75] dark:hover:text-[#F6A035]"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs font-semibold text-[#5C1F75] dark:text-[#E8D1F5]">
                    {t('auth.confirmPasswordLabel')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute start-3.5 top-3.5 h-4 w-4 text-[#A796B5]" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="ps-10 h-11 rounded-2xl border-[#E4D2EE] focus-visible:ring-[#7B2C98]"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <p className="text-xs text-[#7A6A88] dark:text-slate-400">
                  {t('auth.passwordRequirement')}
                </p>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 pt-2">
                <Button
                  type="submit"
                  variant="sanad"
                  size="lg"
                  className="w-full rounded-2xl h-11 text-sm font-bold shadow-md"
                  disabled={isSubmitting || !token}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>{locale === 'ar' ? 'جارٍ التحديث...' : 'Mise à jour en cours...'}</span>
                    </>
                  ) : (
                    t('auth.resetPasswordButton')
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#7B2C98]" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
