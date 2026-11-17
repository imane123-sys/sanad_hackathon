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
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  Scale,
  HeartHandshake,
  UserCheck,
  Building2,
  Home,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t, locale } = useI18n();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'USER' | 'LAWYER' | 'PSYCHOLOGIST' | 'ASSOCIATION' | 'HELP_CENTER'>('USER');
  const [preferredLanguage, setPreferredLanguage] = useState<'fr' | 'ar'>(locale as 'fr' | 'ar');

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ message: string; verificationToken?: string } | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/profile');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate password confirmation
    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    // Validate password complexity
    const passwordRegex = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
    if (password.length < 8 || !passwordRegex.test(password)) {
      setError(t('auth.passwordRequirement'));
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await register({
        email,
        password,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        phone: phone.trim() || undefined,
        role,
        preferredLanguage,
      });

      setSuccessInfo(res);
    } catch (err: any) {
      setError(err?.message || (locale === 'ar' ? 'فشل إنشاء الحساب' : "Échec de l'inscription"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF7FC] text-[#22102E] dark:bg-[#120917] dark:text-[#F6EEFA]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 py-10">
        <div className="w-full max-w-xl space-y-4">
        {/* Top Logo Branding */}
        <div className="text-center pb-1">
          <SanadLogo size="lg" orientation="vertical" />
          <p className="text-xs font-semibold text-[#7A6A88] dark:text-[#A796B5] mt-2">
            {locale === 'ar' ? 'معاً من أجل مجتمع أكثر أماناً وتضامناً' : 'Ensemble pour une société plus sûre et plus solidaire'}
          </p>
        </div>

        <Card className="shadow-lg border-[#EADDF3] dark:border-[#381B4B]">
          <CardHeader className="text-center space-y-1.5 pb-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3EAF8] text-[#5C1F75] dark:bg-[#2B1338] dark:text-[#E8D1F5] mb-1">
              <UserCheck className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-[#4A1663] dark:text-[#E8D1F5]">
              {t('auth.registerTitle')}
            </CardTitle>
            <CardDescription className="text-xs text-[#6C5B7A] dark:text-slate-400">
              {t('auth.registerSubtitle')}
            </CardDescription>
          </CardHeader>

          {successInfo ? (
            <CardContent className="space-y-6 pt-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl dark:bg-emerald-950/30 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-200 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">
                      {locale === 'ar' ? 'تم إنشاء الحساب بنجاح!' : 'Compte créé avec succès !'}
                    </h4>
                    <p className="text-xs mt-1 text-emerald-700 dark:text-emerald-300">
                      {successInfo.message}
                    </p>
                  </div>
                </div>

                {successInfo.verificationToken && (
                  <div className="mt-4 pt-3 border-t border-emerald-200/70 dark:border-emerald-800/60 space-y-2">
                    <p className="text-xs font-medium text-emerald-900 dark:text-emerald-100">
                      {locale === 'ar'
                        ? 'رمز التحقق (وضع التطوير والتجربة) :'
                        : 'Jeton de vérification (environnement de développement) :'}
                    </p>
                    <code className="block p-2 bg-white/80 dark:bg-slate-900/80 rounded border border-emerald-200 dark:border-emerald-800 font-mono text-xs break-all select-all text-slate-800 dark:text-slate-200">
                      {successInfo.verificationToken}
                    </code>
                    <div className="flex gap-2 pt-2">
                      <Link
                        href={`/verify-email?token=${encodeURIComponent(successInfo.verificationToken)}`}
                        className="w-full"
                      >
                        <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                          {locale === 'ar' ? 'تأكيد البريد الإلكتروني الآن' : 'Valider mon adresse e-mail maintenant'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center pt-2">
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    {t('auth.loginButton')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Role selection */}
                <div className="space-y-2">
                  <Label>{t('auth.roleLabel')}</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('USER')}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
                        role === 'USER'
                          ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 dark:bg-emerald-950/50 dark:border-emerald-500 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <UserCheck className="h-4 w-4 mb-1 text-emerald-600 dark:text-emerald-400" />
                      <span>{t('auth.roleUser')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('LAWYER')}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
                        role === 'LAWYER'
                          ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 dark:bg-emerald-950/50 dark:border-emerald-500 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Scale className="h-4 w-4 mb-1 text-emerald-600 dark:text-emerald-400" />
                      <span>{t('auth.roleLawyer')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('PSYCHOLOGIST')}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
                        role === 'PSYCHOLOGIST'
                          ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 dark:bg-emerald-950/50 dark:border-emerald-500 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <HeartHandshake className="h-4 w-4 mb-1 text-emerald-600 dark:text-emerald-400" />
                      <span>{t('auth.rolePsychologist')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('ASSOCIATION')}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
                        role === 'ASSOCIATION'
                          ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 dark:bg-emerald-950/50 dark:border-emerald-500 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Building2 className="h-4 w-4 mb-1 text-emerald-600 dark:text-emerald-400" />
                      <span>{t('auth.roleAssociation')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('HELP_CENTER')}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
                        role === 'HELP_CENTER'
                          ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 dark:bg-emerald-950/50 dark:border-emerald-500 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Home className="h-4 w-4 mb-1 text-emerald-600 dark:text-emerald-400" />
                      <span>{t('auth.roleHelpCenter')}</span>
                    </button>
                  </div>
                </div>

                {/* Email (required) */}
                <div className="space-y-1.5">
                  <Label htmlFor="email">{t('auth.emailLabel')} *</Label>
                  <div className="relative">
                    <Mail className="absolute start-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@exemple.ma"
                      className="ps-9"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* First and Last Name (Optional) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">{t('auth.firstNameLabel')}</Label>
                    <div className="relative">
                      <User className="absolute start-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder={locale === 'ar' ? 'فاطمة' : 'Fatima'}
                        className="ps-9"
                        autoComplete="given-name"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">{t('auth.lastNameLabel')}</Label>
                    <div className="relative">
                      <User className="absolute start-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder={locale === 'ar' ? 'العلوي' : 'Alaoui'}
                        className="ps-9"
                        autoComplete="family-name"
                      />
                    </div>
                  </div>
                </div>

                {/* Phone and Language */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">{t('auth.phoneLabel')}</Label>
                    <div className="relative">
                      <Phone className="absolute start-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+212 600 000 000"
                        className="ps-9"
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="language">{t('auth.preferredLanguageLabel')}</Label>
                    <select
                      id="language"
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value as 'fr' | 'ar')}
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    >
                      <option value="fr">Français</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>
                </div>

                {/* Password and confirmation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="password">{t('auth.passwordLabel')} *</Label>
                    <div className="relative">
                      <Lock className="absolute start-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="ps-9 pe-10"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute end-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">{t('auth.confirmPasswordLabel')} *</Label>
                    <div className="relative">
                      <Lock className="absolute start-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="ps-9"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('auth.passwordRequirement')}
                </p>
                {/* Security Pill */}
                <div className="flex items-center justify-center gap-2 p-2.5 rounded-full bg-[#F4ECF9] border border-[#E8D4F3] text-[11px] font-semibold text-[#5C1F75] dark:bg-[#2B1338] dark:border-[#482061] dark:text-[#E8D1F5]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#5C1F75]" />
                  <span>
                    {locale === 'ar' ? 'بياناتك مشفرة ومحمية بالكامل' : 'Vos données sont protégées et restent confidentielles'}
                  </span>
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
                      <span>{locale === 'ar' ? 'جارٍ إنشاء الحساب...' : 'Création en cours...'}</span>
                    </>
                  ) : (
                    t('auth.registerButton')
                  )}
                </Button>

                <div className="text-center text-xs text-[#6C5B7A] dark:text-slate-400">
                  <span>{t('auth.alreadyHaveAccount')} </span>
                  <Link
                    href="/login"
                    className="font-bold text-[#6A2586] hover:text-[#4A1663] dark:text-[#C48CE0] hover:underline"
                  >
                    {t('auth.loginButton')}
                  </Link>
                </div>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
      </main>
      <Footer />
    </div>
  );
}
