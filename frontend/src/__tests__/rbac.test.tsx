import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Navbar } from '../components/navbar';
import AdminPage from '../app/admin/page';
import ProfessionalPage from '../app/professional/page';
import OrganizationPage from '../app/organization/page';
import { LanguageProvider } from '../i18n/context';
import * as authContextModule from '../context/auth-context';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
}));

describe('Role-Based Access Control (RBAC) - Frontend', () => {
  const mockAuth = (user: any) => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user,
      accessToken: user ? 'mock_token' : null,
      isAuthenticated: !!user,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      logoutAll: vi.fn(),
      refreshProfile: vi.fn(),
    });
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Navbar Role Adaptation', () => {
    it('shows Administration portal link when user has role ADMIN', () => {
      mockAuth({
        id: '1',
        email: 'admin@sanad.ma',
        role: 'ADMIN',
        firstName: 'Admin',
      });

      render(
        <LanguageProvider>
          <Navbar />
        </LanguageProvider>,
      );

      expect(screen.getByText(/Administration|الإدارة/i)).toBeInTheDocument();
      expect(screen.queryByText(/Espace Pro|فضاء المهني/i)).toBeNull();
    });

    it('shows Espace Pro portal link when user has role LAWYER', () => {
      mockAuth({
        id: '2',
        email: 'lawyer@sanad.ma',
        role: 'LAWYER',
        firstName: 'Maitre',
      });

      render(
        <LanguageProvider>
          <Navbar />
        </LanguageProvider>,
      );

      expect(screen.getByText(/Espace Pro|فضاء المهني/i)).toBeInTheDocument();
      expect(screen.queryByText(/Administration|الإدارة/i)).toBeNull();
    });

    it('shows Espace Organisme link when user has role ASSOCIATION', () => {
      mockAuth({
        id: '3',
        email: 'assoc@sanad.ma',
        role: 'ASSOCIATION',
        firstName: 'Solidarité',
      });

      render(
        <LanguageProvider>
          <Navbar />
        </LanguageProvider>,
      );

      expect(screen.getByText(/Espace Organisme|فضاء الهيئة/i)).toBeInTheDocument();
      expect(screen.queryByText(/Administration|الإدارة/i)).toBeNull();
    });

    it('does NOT show administrative or professional portal links for standard USER', () => {
      mockAuth({
        id: '4',
        email: 'user@sanad.ma',
        role: 'USER',
        firstName: 'Fatima',
      });

      render(
        <LanguageProvider>
          <Navbar />
        </LanguageProvider>,
      );

      expect(screen.queryByText(/Administration|الإدارة/i)).toBeNull();
      expect(screen.queryByText(/Espace Pro|فضاء المهني/i)).toBeNull();
      expect(screen.queryByText(/Espace Organisme|فضاء الهيئة/i)).toBeNull();
    });
  });

  describe('Page Access Restrictions (403 Screens)', () => {
    it('blocks USER role from viewing Admin page and displays 403 Unauthorized banner', () => {
      mockAuth({
        id: '4',
        email: 'user@sanad.ma',
        role: 'USER',
        firstName: 'Fatima',
      });

      render(
        <LanguageProvider>
          <AdminPage />
        </LanguageProvider>,
      );

      expect(screen.getByText(/Accès non autorisé|ولوج غير مصرح به/i)).toBeInTheDocument();
    });

    it('blocks USER role from viewing Professional page and displays 403 Unauthorized banner', () => {
      mockAuth({
        id: '4',
        email: 'user@sanad.ma',
        role: 'USER',
        firstName: 'Fatima',
      });

      render(
        <LanguageProvider>
          <ProfessionalPage />
        </LanguageProvider>,
      );

      expect(screen.getByText(/Accès non autorisé|ولوج غير مصرح به/i)).toBeInTheDocument();
    });

    it('blocks USER role from viewing Organization page and displays 403 Unauthorized banner', () => {
      mockAuth({
        id: '4',
        email: 'user@sanad.ma',
        role: 'USER',
        firstName: 'Fatima',
      });

      render(
        <LanguageProvider>
          <OrganizationPage />
        </LanguageProvider>,
      );

      expect(screen.getByText(/Accès non autorisé|ولوج غير مصرح به/i)).toBeInTheDocument();
    });
  });
});
