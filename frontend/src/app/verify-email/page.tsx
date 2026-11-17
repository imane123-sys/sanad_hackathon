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
import { ShieldCheck, CheckCircle2, AlertCircle, Loader2, KeyRound } from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useI18n();

  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      handleVerify(tokenFromUrl);
    }
  }, [searchParams]);

  const handleVerify = async (tokenToVerify?: string) => {
    const targetToken = tokenToVerify || token;
    if (!targetToken) {
      setError(locale === 'ar' ? 'يرجى إدخال رمز التحقق' : 'Veuillez saisir le jeton de vérification');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await api.auth.verifyEmail(targetToken);
      setSuccessMessage(res.message);
    } catch (err: any) {
      setError(err?.message || (locale === 'ar' ? 'فشل التحقق من البريد الإلكتروني' : 'Échec de la vérification'));
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <CardHeader className="text-center space-y-1.5 pb-4">
            <CardTitle className="text-2xl font-bold tracking-tight text-[#4A1663] dark:text-[#E8D1F5]">
              {locale === 'ar' ? 'تأكيد البريد الإلكتروني' : "Vérification de l'adresse e-mail"}
            </CardTitle>
            <CardDescription className="text-xs text-[#6C5B7A] dark:text-slate-400">
              {locale === 'ar'
                ? 'أدخلي رمز التحقق لتأكيد حسابك وتفعيله'
                : 'Saisissez le jeton de vérification pour activer votre compte.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {successMessage ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl dark:bg-emerald-950/30 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-200 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <p className="text-sm font-semibold">{successMessage}</p>
                </div>
                <div className="pt-2">
                  <Link href="/login">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                      {t('auth.loginButton')}
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerify();
                }}
                className="space-y-4"
              >
                {error && (
                  <div className="flex items-center gap-2 p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="token">{locale === 'ar' ? 'رمز التحقق' : 'Jeton de vérification'}</Label>
                  <div className="relative">
                    <KeyRound className="absolute start-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="token"
                      type="text"
                      required
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Collez votre code de vérification..."
                      className="ps-9 font-mono text-xs"
                    />
                  </div>
                </div>

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
                      <span>{locale === 'ar' ? 'جارٍ التحقق...' : 'Vérification en cours...'}</span>
                    </>
                  ) : (
                    locale === 'ar' ? 'تأكيد الحساب' : 'Vérifier mon compte'
                  )}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex justify-center border-t border-slate-100 dark:border-slate-800 pt-4">
            <Link
              href="/login"
              className="text-xs text-slate-500 hover:text-emerald-600 dark:text-slate-400 hover:underline"
            >
              {t('auth.backToLogin')}
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
