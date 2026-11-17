import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuickExitButton } from '../components/quick-exit-button';
import { LanguageProvider } from '../i18n/context';
import { AuthProvider } from '../context/auth-context';
import LoginPage from '../app/login/page';
import RegisterPage from '../app/register/page';

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
}));

describe('Authentication & Safety Modules', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  describe('QuickExitButton (§4.1 Security Compliance)', () => {
    it('renders the header variant with exit label', () => {
      render(
        <LanguageProvider>
          <QuickExitButton variant="header" />
        </LanguageProvider>,
      );

      expect(screen.getByText(/خروج سريع|Sortie Rapide/i)).toBeInTheDocument();
    });

    it('renders floating variant and displays browser history warning on info toggle', () => {
      render(
        <LanguageProvider>
          <QuickExitButton variant="floating" />
        </LanguageProvider>,
      );

      const infoBtn = screen.getByLabelText('Info sortie rapide');
      fireEvent.click(infoBtn);

      // Verify that the safety warning explicitly notes that browser history is NOT cleared
      expect(
        screen.getByText(/لا يمسح سجل المتصفح|ne supprime pas l'historique du navigateur/i),
      ).toBeInTheDocument();
    });

    it('clears storage and redirects immediately to a neutral destination on click', () => {
      localStorage.setItem('sanad_access_token', 'sensitive_token');
      localStorage.setItem('sanad_user', JSON.stringify({ id: '123' }));
      sessionStorage.setItem('temp_data', 'draft_evidence');

      // Mock window.location.replace
      const originalReplace = window.location.replace;
      const mockReplace = vi.fn();
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { replace: mockReplace },
      });

      render(
        <LanguageProvider>
          <QuickExitButton variant="header" />
        </LanguageProvider>,
      );

      const exitBtn = screen.getByRole('button', { name: /خروج سريع|Sortie Rapide/i });
      fireEvent.click(exitBtn);

      // Storage must be purged
      expect(localStorage.getItem('sanad_access_token')).toBeNull();
      expect(localStorage.getItem('sanad_user')).toBeNull();
      expect(sessionStorage.getItem('temp_data')).toBeNull();

      // Location must be replaced with neutral URL (Google)
      expect(mockReplace).toHaveBeenCalledWith('https://www.google.com');

      // Restore
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { replace: originalReplace },
      });
    });
  });

  describe('Login Form', () => {
    it('renders email and password inputs with submit button', () => {
      render(
        <AuthProvider>
          <LanguageProvider>
            <LoginPage />
          </LanguageProvider>
        </AuthProvider>,
      );

      expect(screen.getByLabelText(/البريد الإلكتروني|Adresse e-mail/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/كلمة المرور|Mot de passe/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /تسجيل الدخول|Se connecter/i })).toBeInTheDocument();
    });
  });

  describe('Register Form', () => {
    it('renders role options and password complexity rules', () => {
      render(
        <AuthProvider>
          <LanguageProvider>
            <RegisterPage />
          </LanguageProvider>
        </AuthProvider>,
      );

      expect(screen.getByText(/مستفيدة|Une citoyenne/i)).toBeInTheDocument();
      expect(screen.getByText(/محامية|Avocate/i)).toBeInTheDocument();
      expect(screen.getByText(/أخصائية|Psychologue/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/تأكيد كلمة المرور|Confirmer le mot de passe/i)).toBeInTheDocument();
    });
  });
});
