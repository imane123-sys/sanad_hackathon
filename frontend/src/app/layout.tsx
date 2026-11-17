import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/i18n/context';
import { AuthProvider } from '@/context/auth-context';
import { QuickExitButton } from '@/components/quick-exit-button';

export const metadata: Metadata = {
  title: 'سَنَد | SANAD — حليفة النساء وأمانهن',
  description:
    'منصة سَنَد الرقمية: معاً من أجل أمانكم وتضامنكم. فضاء آمن للدعم والاستشارات والمساعدة الذكية.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
        <LanguageProvider>
          <AuthProvider>
            {children}
            <QuickExitButton variant="floating" />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
