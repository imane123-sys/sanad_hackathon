'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useI18n } from '@/i18n/context';
import { SanadLogo } from '@/components/sanad-logo';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t, locale, dir } = useI18n();
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/profile');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const deviceInfo = typeof window !== 'undefined' ? window.navigator.userAgent : 'Web Browser';
      await login(email, password, deviceInfo);
      router.push('/profile');
    } catch (err: any) {
      setError(err?.message || (locale === 'ar' ? 'حدث خطأ أثناء تسجيل الدخول' : 'Erreur de connexion'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF7FC] text-[#22102E] dark:bg-[#120917] dark:text-[#F6EEFA]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
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
              {t('auth.loginTitle')}
            </CardTitle>
            <CardDescription className="text-xs text-[#6C5B7A] dark:text-slate-400">
              {t('auth.loginSubtitle')}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-[#4A1663] dark:text-[#E8D1F5]">
                  {t('auth.emailLabel')}
                </Label>
                <div className="relative">
                  <Mail className="absolute start-3.5 top-3.5 h-4 w-4 text-[#7A3E94]" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@exemple.ma"
                    className="ps-10"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold text-[#4A1663] dark:text-[#E8D1F5]">
                    {t('auth.passwordLabel')}
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-[#6A2586] hover:text-[#4A1663] dark:text-[#C48CE0] hover:underline"
                  >
                    {t('auth.forgotPasswordLink')}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute start-3.5 top-3.5 h-4 w-4 text-[#7A3E94]" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="ps-10 pe-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3.5 top-3.5 text-[#9F8CAD] hover:text-[#5C1F75]"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Security Pill */}
              <div className="flex items-center justify-center gap-2 p-2.5 rounded-full bg-[#F4ECF9] border border-[#E8D4F3] text-[11px] font-semibold text-[#5C1F75] dark:bg-[#2B1338] dark:border-[#482061] dark:text-[#E8D1F5]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#5C1F75]" />
                <span>
                  {locale === 'ar' ? 'بياناتك مشفرة ومحمية بالكامل' : 'Vos données sont protégées et restent confidentielles'}
                </span>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-1">
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
                    <span>{locale === 'ar' ? 'جارٍ تسجيل الدخول...' : 'Connexion en cours...'}</span>
                  </>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>{t('auth.loginButton')}</span>
                    <ArrowIcon className="h-4 w-4" />
                  </span>
                )}
              </Button>

              <div className="text-center text-xs text-[#6C5B7A] dark:text-slate-400">
                <span>{t('auth.noAccount')} </span>
                <Link
                  href="/register"
                  className="font-bold text-[#6A2586] hover:text-[#4A1663] dark:text-[#C48CE0] hover:underline"
                >
                  {t('auth.registerButton')}
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
      </main>
      <Footer />
    </div>
  );
}
