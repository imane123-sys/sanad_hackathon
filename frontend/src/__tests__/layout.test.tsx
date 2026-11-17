import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { Navbar } from '../components/navbar';
import { Footer } from '../components/footer';
import { UserMenu } from '../components/user-menu';
import { RoleSidebar } from '../components/role-sidebar';
import { ProtectedLayout } from '../components/protected-layout';
import { EmergencyModal } from '../components/emergency-modal';
import { LanguageProvider } from '../i18n/context';
import * as authContextModule from '../context/auth-context';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/admin',
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
}));

describe('SANAD Global Application Layout & Role Layouts', () => {
  const mockAuth = (user: any) => {
    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user,
      accessToken: user ? 'mock_jwt_token' : null,
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

  describe('Navbar & Emergency Hotline Modal', () => {
    it('renders logo, language switcher, quick exit and opens 1919 emergency modal', () => {
      mockAuth(null);

      render(
        <LanguageProvider>
          <Navbar />
        </LanguageProvider>,
      );

      // Verify brand mark
      expect(screen.getByText('سَنَد')).toBeInTheDocument();
      expect(screen.getByText('SANAD')).toBeInTheDocument();

      // Verify Quick Exit and Hotline button
      expect(screen.getByText('خروج سريع')).toBeInTheDocument();
      const hotlineBtn = screen.getByText('1919');
      expect(hotlineBtn).toBeInTheDocument();

      // Click hotline button to open Emergency Modal
      fireEvent.click(hotlineBtn);

      // Verify emergency numbers inside modal
      expect(screen.getByText(/أرقام الطوارئ والمساعدة الفورية|Numéros d'urgence/i)).toBeInTheDocument();
      expect(screen.getByText(/الشرطة الوطنية|Police Secours/i)).toBeInTheDocument();
      expect(screen.getByText(/الدرك الملكي|Gendarmerie Royale/i)).toBeInTheDocument();
      expect(screen.getByText(/الإسعاف الطبي|SAMU/i)).toBeInTheDocument();
    });
  });

  describe('UserMenu Dropdown', () => {
    it('renders user initials, role badge, and profile links when open', () => {
      mockAuth({
        id: 'user-1',
        email: 'fatima@sanad.ma',
        firstName: 'Fatima',
        lastName: 'Zahra',
        role: 'USER',
      });

      render(
        <LanguageProvider>
          <UserMenu />
        </LanguageProvider>,
      );

      // Click trigger button
      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);

      // Verify dropdown content
      expect(screen.getByText('Fatima Zahra')).toBeInTheDocument();
      expect(screen.getByText('fatima@sanad.ma')).toBeInTheDocument();
      expect(screen.getByText(/ملفي الشخصي|Mon Profil/i)).toBeInTheDocument();
      expect(screen.getByText(/تسجيل الخروج|Déconnexion/i)).toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    it('renders CNDP Loi 09-08 compliance statement, quick links, and emergency helplines', () => {
      render(
        <LanguageProvider>
          <Footer />
        </LanguageProvider>,
      );

      // Verify Loi 09-08 compliance notice
      expect(screen.getAllByText(/09-08/i).length).toBeGreaterThan(0);

      // Verify Quick Links
      expect(screen.getByText(/الرئيسية|Accueil/i)).toBeInTheDocument();

      // Verify Emergency Section
      expect(screen.getByText(/أرقام الطوارئ في المغرب|Numéros d'urgence au Maroc/i)).toBeInTheDocument();
      expect(screen.getByText(/177/i)).toBeInTheDocument();
      expect(screen.getByText(/141/i)).toBeInTheDocument();
    });
  });

  describe('RoleSidebar', () => {
    it('renders Admin space items when user has ADMIN role', () => {
      mockAuth({
        id: 'admin-1',
        email: 'admin@sanad.ma',
        role: 'ADMIN',
        firstName: 'Admin',
      });

      render(
        <LanguageProvider>
          <RoleSidebar />
        </LanguageProvider>,
      );

      expect(screen.getAllByText(/الإدارة|Administration/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/المستخدمون|Utilisateurs/i)).toBeInTheDocument();
      expect(screen.getByText(/ملفات التحقق|Dossiers de vérification/i)).toBeInTheDocument();
      expect(screen.getByText(/سجل الأنشطة والأمان|Journal d'audit/i)).toBeInTheDocument();
    });

    it('renders Professional space items when user has LAWYER role', () => {
      mockAuth({
        id: 'pro-1',
        email: 'lawyer@sanad.ma',
        role: 'LAWYER',
        firstName: 'Maitre',
      });

      render(
        <LanguageProvider>
          <RoleSidebar />
        </LanguageProvider>,
      );

      expect(screen.getAllByText(/فضاء المهني|Espace Pro/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/خدماتي وأتعابي|Mes services/i)).toBeInTheDocument();
      expect(screen.getByText(/طلبات المرافقة|Demandes d'accompagnement/i)).toBeInTheDocument();
    });
  });

  describe('ProtectedLayout Access Enforcement', () => {
    it('renders content when user has required role', () => {
      mockAuth({
        id: 'admin-1',
        email: 'admin@sanad.ma',
        role: 'ADMIN',
        firstName: 'Admin',
      });

      render(
        <LanguageProvider>
          <ProtectedLayout allowedRoles={['ADMIN']}>
            <div data-testid="admin-content">Admin Dashboard Secret Content</div>
          </ProtectedLayout>
        </LanguageProvider>,
      );

      expect(screen.getByTestId('admin-content')).toBeInTheDocument();
    });

    it('blocks unauthorized roles with 403 forbidden screen', () => {
      mockAuth({
        id: 'user-1',
        email: 'user@sanad.ma',
        role: 'USER',
        firstName: 'Fatima',
      });

      render(
        <LanguageProvider>
          <ProtectedLayout allowedRoles={['ADMIN']}>
            <div data-testid="admin-content">Admin Dashboard Secret Content</div>
          </ProtectedLayout>
        </LanguageProvider>,
      );

      expect(screen.queryByTestId('admin-content')).toBeNull();
      expect(screen.getByText(/Accès non autorisé|ولوج غير مصرح به/i)).toBeInTheDocument();
    });
  });
});
