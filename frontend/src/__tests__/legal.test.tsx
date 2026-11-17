import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import LegalResourcesPage from '../app/legal-resources/page';
import { LanguageProvider } from '../i18n/context';
import * as authContextModule from '../context/auth-context';
import { api } from '../lib/api';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/legal-resources',
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
}));

vi.mock('../lib/api', () => ({
  api: {
    legal: {
      getResources: vi.fn(),
      getCategories: vi.fn(),
      getResource: vi.fn(),
      getAdminResources: vi.fn(),
      createResource: vi.fn(),
      updateResource: vi.fn(),
      verifyResource: vi.fn(),
      toggleResourceStatus: vi.fn(),
      deleteResource: vi.fn(),
    },
  },
}));

const mockLegalResources = [
  {
    id: 'res-1',
    title: 'القانون 103-13 — تجريم العنف ضد النساء وتشديد العقوبات في محيط الأسرة',
    description:
      'يُعرّف القانون رقم 103-13 العنف ضد النساء بكل فعل مادي أو معنوي، وتُضاعف العقوبات السجنية عند ارتكابه من طرف الزوج.',
    legalReference: 'القانون رقم 103-13، المواد 1 إلى 5',
    officialSource: 'الجريدة الرسمية عدد 6655 / ظهير 1-18-19',
    category: 'CRIMINAL_LAW_VIOLENCE',
    language: 'ar',
    publishedAt: '2018-03-12T00:00:00.000Z',
    lastVerifiedAt: '2026-01-15T00:00:00.000Z',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 'res-2',
    title: 'Code de la Famille — Divorce judiciaire pour préjudice (Tatliq li-Darar)',
    description:
      'Chaque épouse victime d’un préjudice physique ou moral peut obtenir la dissolution judiciaire du lien conjugal.',
    legalReference: 'Moudawana, Articles 98 à 101',
    officialSource: 'Bulletin Officiel n° 5184 / Dahir n° 1-04-22',
    category: 'FAMILY_LAW',
    language: 'fr',
    publishedAt: '2004-02-05T00:00:00.000Z',
    lastVerifiedAt: '2026-01-20T00:00:00.000Z',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-20T00:00:00.000Z',
  },
  {
    id: 'res-3',
    title: 'مشروع مسطرة التدبير الاستعجالي لمراكز الإيواء (قيد المراجعة الفنية)',
    description:
      'مبادئ توجيهية حول تدابير الإيواء الاستعجالي. هذا النص ما زال قيد الدراسة الفنية ولم يصدر بعد في الجريدة الرسمية.',
    legalReference: 'مشروع مسطرة التدبير الاستعجالي',
    officialSource: 'لجنة التنسيق القطاعي (في طور المصادقة)',
    category: 'CIVIL_PROTECTION',
    language: 'ar',
    publishedAt: '2025-11-10T00:00:00.000Z',
    lastVerifiedAt: null, // Unverified / Pending review
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const mockCategories = [
  { category: 'CRIMINAL_LAW_VIOLENCE', total: 1, verified: 1, unverified: 0 },
  { category: 'FAMILY_LAW', total: 1, verified: 1, unverified: 0 },
  { category: 'CIVIL_PROTECTION', total: 1, verified: 0, unverified: 1 },
];

function renderWithProviders(ui: React.ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe('Legal Information Module - Frontend', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        role: 'USER',
        preferredLanguage: 'ar',
        isEmailVerified: true,
      },
      accessToken: 'token-123',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      logoutAll: vi.fn(),
      refreshProfile: vi.fn(),
    });

    (api.legal.getResources as any).mockResolvedValue({
      items: mockLegalResources,
      total: mockLegalResources.length,
      page: 1,
      limit: 50,
      totalPages: 1,
      stats: {
        totalVerified: 2,
        totalUnverified: 1,
        totalActive: 3,
      },
    });
    (api.legal.getCategories as any).mockResolvedValue(mockCategories);
  });

  it('renders official Moroccan legal resources with categories and sources', async () => {
    renderWithProviders(<LegalResourcesPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/103-13/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Tatliq li-Darar/i)).toBeInTheDocument();
    });

    // Check presence of official source references
    expect(screen.getByText(/6655/i)).toBeInTheDocument();
    expect(screen.getByText(/5184/i)).toBeInTheDocument();
  });

  it('clearly distinguishes verified information from content requiring further verification', async () => {
    renderWithProviders(<LegalResourcesPage />);

    await waitFor(() => {
      // Verified badges (emerald)
      const verifiedBadges = screen.getAllByText(/موثق ورسمي|officielle/i);
      expect(verifiedBadges.length).toBeGreaterThan(0);

      // Unverified / Pending badge (amber warning)
      const unverifiedBadges = screen.getAllByText(/في انتظار التدقيق|vérification légale/i);
      expect(unverifiedBadges.length).toBeGreaterThan(0);
    });
  });

  it('filters legal resources when searching by keyword or article reference', async () => {
    renderWithProviders(<LegalResourcesPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/103-13/i).length).toBeGreaterThan(0);
    });

    const searchInput = screen.getByRole('textbox');
    fireEvent.change(searchInput, { target: { value: 'Moudawana' } });

    await waitFor(() => {
      expect(api.legal.getResources).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'Moudawana',
        }),
      );
    });
  });

  it('filters resources by verification status (all, verified, unverified)', async () => {
    renderWithProviders(<LegalResourcesPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/103-13/i).length).toBeGreaterThan(0);
    });

    // Click verified only filter
    const verifiedBtn = screen.getByRole('button', { name: /مصادر رسمية موثقة ومعتمدة|Sources officielles vérifiées/i });
    fireEvent.click(verifiedBtn);

    await waitFor(() => {
      expect(api.legal.getResources).toHaveBeenCalledWith(
        expect.objectContaining({
          verificationStatus: 'verified',
        }),
      );
    });

    // Click unverified filter
    const unverifiedBtn = screen.getByRole('button', { name: /في انتظار التدقيق القانوني|En cours de vérification légale/i });
    fireEvent.click(unverifiedBtn);

    await waitFor(() => {
      expect(api.legal.getResources).toHaveBeenCalledWith(
        expect.objectContaining({
          verificationStatus: 'unverified',
        }),
      );
    });
  });

  it('opens detailed legal modal with official legal references and rights upon click', async () => {
    renderWithProviders(<LegalResourcesPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/103-13/i).length).toBeGreaterThan(0);
    });

    const detailButtons = screen.getAllByText(/الاطلاع على النص الكامل|Consulter le texte complet/i);
    fireEvent.click(detailButtons[0]);

    await waitFor(() => {
      // Modal should display full detailed rights and legal aid notice
      expect(screen.getByText(/المساعدة القضائية المجانية|aide juridictionnelle gratuite/i)).toBeInTheDocument();
    });
  });

  it('provides direct access to Moroccan emergency hotline 1919 and professional orientation', async () => {
    renderWithProviders(<LegalResourcesPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/1919/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/محامية|avocate/i).length).toBeGreaterThan(0);
    });
  });
});
