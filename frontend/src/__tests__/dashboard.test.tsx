import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserDashboardPage from '../app/dashboard/page';
import { LanguageProvider } from '../i18n/context';
import * as authContextModule from '../context/auth-context';
import { api } from '../lib/api';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/dashboard',
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
}));

vi.mock('../lib/api', () => ({
  api: {
    user: {
      getDashboard: vi.fn(),
      getEvidences: vi.fn(),
      getEvidenceFolders: vi.fn(),
      getSharedWithMe: vi.fn(),
      createEvidence: vi.fn(),
      deleteEvidence: vi.fn(),
      getAssistanceRequests: vi.fn(),
      createAssistanceRequest: vi.fn(),
      getNotifications: vi.fn(),
      markNotificationRead: vi.fn(),
      markAllNotificationsRead: vi.fn(),
      getAnalysis: vi.fn(),
      createAnalysis: vi.fn(),
      getResources: vi.fn(),
    },
    ai: {
      generate: vi.fn(),
    },
  },
}));

describe('SANAD User Dashboard - Frontend', () => {
  const mockUser = {
    id: 'user-789',
    email: 'fatima@example.com',
    firstName: 'Fatima',
    lastName: 'Zahra',
    fullName: 'Fatima Zahra',
    phone: '+212600000000',
    role: 'USER',
    status: 'ACTIVE',
    isEmailVerified: true,
    preferredLanguage: 'ar',
    createdAt: '2026-01-01T00:00:00Z',
  };

  const mockDashboardData = {
    user: mockUser,
    metrics: {
      evidenceCount: 4,
      activeRequestsCount: 2,
      unreadNotificationsCount: 1,
      activeSessionsCount: 1,
    },
    recentEvidences: [
      {
        id: 'ev-1',
        fileName: 'certificat_medical.pdf',
        fileUrl: 'https://vault.sanad.ma/secure/1.pdf',
        mimeType: 'application/pdf',
        size: 154200,
        sha256: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
        description: 'Certificat médical délivré par CHU',
        status: 'STORED',
        createdAt: '2026-02-15T10:00:00Z',
      },
    ],
    recentRequests: [
      {
        id: 'req-1',
        typeAssistance: 'LEGAL',
        description: 'Demande d’aide pour ordonnance d’éloignement',
        status: 'EN_COURS',
        createdAt: '2026-02-16T14:30:00Z',
        updatedAt: '2026-02-16T14:30:00Z',
        professional: {
          user: {
            firstName: 'Nadia',
            lastName: 'Merzoug',
            fullName: 'Me Nadia Merzoug',
            phone: '+212600000002',
            email: 'nadia@barreau.ma',
          },
        },
      },
    ],
    recentNotifications: [
      {
        id: 'notif-1',
        type: 'ASSISTANCE_REQUEST',
        neutralContent: 'Votre démarche d’assistance a été enregistrée avec succès.',
        isRead: false,
        readAt: null,
        createdAt: '2026-02-16T14:30:00Z',
      },
    ],
    emergencyHelplines: [
      {
        id: 'em-1',
        name: 'Ligne 1919',
        serviceType: 'NATIONAL_HELPLINE',
        phone: '1919',
        availability: '24/7',
        city: null,
      },
    ],
    timestamp: '2026-02-17T12:00:00Z',
  };

  const mockResources = {
    professionals: [
      {
        id: 'pro-1',
        professionalType: 'LAWYER',
        specialty: 'Droit de la famille & Protection',
        city: 'Casablanca',
        address: 'Boulevard d’Anfa',
        phone: '+212522000000',
        isVolunteer: true,
        verificationStatus: 'VERIFIED',
        user: {
          firstName: 'Sara',
          lastName: 'Benali',
          fullName: 'Me Sara Benali',
          email: 'sara@barreau-casablanca.ma',
          phone: '+212600000001',
        },
        services: [],
      },
    ],
    helpCenters: [
      {
        id: 'hc-1',
        name: 'Centre d’Accueil Al-Amal',
        address: 'Quartier Bourgogne',
        city: 'Casablanca',
        phone: '+212522111222',
        openingHours: '24/7',
        isFree: true,
        receptionConditions: 'Accueil d’urgence inconditionnel',
      },
    ],
    emergencyResources: [
      {
        id: 'em-1',
        name: 'Ligne Nationale de Protection',
        serviceType: 'NATIONAL_HELPLINE',
        phone: '1919',
        address: null,
        description: 'Ligne d’écoute 24/7',
        availability: '24/7',
        city: null,
      },
    ],
    legalResources: [
      {
        id: 'lr-1',
        title: 'Loi n° 103-13 relative aux violences faites aux femmes',
        description: 'Incrimine toutes les formes de violence et prévoit des ordonnances de protection.',
        legalReference: 'Bulletin Officiel n° 6655',
        officialSource: 'Ministère de la Justice',
        category: 'PROTECTION_VIOLENCE',
      },
    ],
    timestamp: '2026-02-17T12:00:00Z',
  };

  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: mockUser,
      accessToken: 'mock_token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      logoutAll: vi.fn(),
      refreshProfile: vi.fn(),
    });

    vi.mocked(api.user.getDashboard).mockResolvedValue(mockDashboardData);
    vi.mocked(api.user.getEvidences).mockResolvedValue(mockDashboardData.recentEvidences);
    vi.mocked(api.user.getEvidenceFolders).mockResolvedValue([]);
    vi.mocked(api.user.getSharedWithMe).mockResolvedValue([]);
    vi.mocked(api.user.getAssistanceRequests).mockResolvedValue(mockDashboardData.recentRequests);
    vi.mocked(api.user.getNotifications).mockResolvedValue(mockDashboardData.recentNotifications);
    vi.mocked(api.user.getResources).mockResolvedValue(mockResources);
    vi.mocked(api.user.getAnalysis).mockResolvedValue([]);
  });

  it('renders the dashboard with reassurance banner and Loi 09-08 compliance', async () => {
    render(
      <LanguageProvider>
        <UserDashboardPage />
      </LanguageProvider>,
    );

    await waitFor(() => {
      expect(screen.getAllByText(/09-08/i).length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText(/1919/i).length).toBeGreaterThan(0);
  });

  it('displays real metrics from backend API', async () => {
    render(
      <LanguageProvider>
        <UserDashboardPage />
      </LanguageProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('4')).toBeInTheDocument(); // Evidence count
      expect(screen.getByText('2')).toBeInTheDocument(); // Active requests count
    });
  });

  it('allows navigating between dashboard tabs', async () => {
    render(
      <LanguageProvider>
        <UserDashboardPage />
      </LanguageProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    // Click on AI Assistant tab button
    const aiTabButton = screen.getByTestId('tab-aiAssistant');
    fireEvent.click(aiTabButton);

    await waitFor(() => {
      expect(
        screen.getAllByText(/مساعد سند الذكي|Assistant Intelligent SANAD/i).length,
      ).toBeGreaterThan(0);
    });
  });

  it('displays real evidences in vault with SHA-256 hash', async () => {
    render(
      <LanguageProvider>
        <UserDashboardPage />
      </LanguageProvider>,
    );

    // Switch to evidence tab
    const evidenceTabButton = screen.getByTestId('tab-evidence');
    fireEvent.click(evidenceTabButton);

    await waitFor(() => {
      expect(screen.getByText('certificat_medical.pdf')).toBeInTheDocument();
      expect(screen.getByText(/SHA-256:/i)).toBeInTheDocument();
    });
  });

  it('displays verified professionals in directory tab', async () => {
    render(
      <LanguageProvider>
        <UserDashboardPage />
      </LanguageProvider>,
    );

    // Switch to directory tab
    const directoryTabButton = screen.getByTestId('tab-directory');
    fireEvent.click(directoryTabButton);

    await waitFor(() => {
      expect(screen.getByText(/Sara Benali/i)).toBeInTheDocument();
      expect(screen.getByText(/Centre d’Accueil Al-Amal/i)).toBeInTheDocument();
    });
  });

  it('displays 24/7 Moroccan emergency numbers in emergency tab', async () => {
    render(
      <LanguageProvider>
        <UserDashboardPage />
      </LanguageProvider>,
    );

    // Switch to emergency tab
    const emergencyTabButton = screen.getByTestId('tab-emergency');
    fireEvent.click(emergencyTabButton);

    await waitFor(() => {
      expect(screen.getAllByText(/1919/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText('177').length).toBeGreaterThan(0);
      expect(screen.getAllByText('141').length).toBeGreaterThan(0);
    });
  });
});
