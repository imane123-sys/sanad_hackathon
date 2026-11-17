import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EvidenceVault } from '../components/evidence-vault';
import { LanguageProvider } from '../i18n/context';
import * as authContextModule from '../context/auth-context';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
  api: {
    user: {
      getEvidences: vi.fn(),
      getEvidenceFolders: vi.fn(),
      createEvidenceFolder: vi.fn(),
      deleteEvidenceFolder: vi.fn(),
      assignEvidenceFolder: vi.fn(),
      uploadEvidence: vi.fn(),
      deleteEvidence: vi.fn(),
      verifyEvidence: vi.fn(),
      getEvidenceShares: vi.fn(),
      createEvidenceShare: vi.fn(),
      revokeEvidenceShare: vi.fn(),
      getEvidenceLogs: vi.fn(),
      getSharedWithMe: vi.fn(),
      downloadEvidenceFile: vi.fn(),
      viewEvidenceBlobUrl: vi.fn(),
    },
  },
}));

describe('SANAD Evidence Management Module - Frontend', () => {
  const mockUser = {
    id: 'user-101',
    email: 'khadija@example.com',
    firstName: 'Khadija',
    lastName: 'Alaoui',
    fullName: 'Khadija Alaoui',
    role: 'USER',
    status: 'ACTIVE',
    isEmailVerified: true,
    preferredLanguage: 'fr',
    createdAt: '2026-01-01T00:00:00Z',
  };

  const mockFolders = [
    {
      id: 'folder-1',
      name: 'Violences Janvier 2026',
      description: 'Photos et constats',
      _count: { evidences: 2 },
    },
  ];

  const mockEvidences = [
    {
      id: 'ev-1',
      fileName: 'constat_agression.jpg',
      fileUrl: 'storage/evidences/user-101/constat_agression.jpg',
      mimeType: 'image/jpeg',
      size: 2450000,
      sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      description: 'Constat photographique des hématomes',
      createdAt: '2026-01-15T10:00:00Z',
      folder: { id: 'folder-1', name: 'Violences Janvier 2026' },
      _count: { accessLogs: 3, sharePermissions: 1 },
      sharePermissions: [
        {
          id: 'share-1',
          permission: 'READ_ONLY',
          validUntil: '2026-03-01T00:00:00Z',
          recipient: {
            id: 'lawyer-1',
            email: 'avocate@barreau.ma',
            fullName: 'Me Nadia Merzoug',
            role: 'LAWYER',
          },
        },
      ],
    },
  ];

  const mockSharedWithMe = [
    {
      shareId: 'share-99',
      permission: 'READ_ONLY',
      status: 'ACTIVE',
      validFrom: '2026-02-01T00:00:00Z',
      validUntil: '2026-03-01T00:00:00Z',
      evidence: {
        id: 'ev-shared-1',
        fileName: 'rapport_medical_partage.pdf',
        fileUrl: 'storage/evidences/user-200/rapport.pdf',
        mimeType: 'application/pdf',
        size: 890000,
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        description: 'Rapport médical sous pli confidentiel',
        createdAt: '2026-02-05T12:00:00Z',
        user: {
          id: 'user-200',
          email: 'patiente@example.com',
          fullName: 'Aicha Tazi',
        },
      },
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.setItem('sanad_lang', 'fr');

    vi.spyOn(authContextModule, 'useAuth').mockReturnValue({
      user: mockUser,
      accessToken: 'jwt_token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      logoutAll: vi.fn(),
      refreshProfile: vi.fn(),
    });

    vi.mocked(api.user.getEvidences).mockResolvedValue(mockEvidences);
    vi.mocked(api.user.getEvidenceFolders).mockResolvedValue(mockFolders);
    vi.mocked(api.user.getSharedWithMe).mockResolvedValue(mockSharedWithMe);
    vi.mocked(api.user.uploadEvidence).mockResolvedValue({ id: 'ev-new', fileName: 'test.jpg' });
    vi.mocked(api.user.createEvidenceFolder).mockResolvedValue({ id: 'folder-new', name: 'Nouveau' });
    vi.mocked(api.user.verifyEvidence).mockResolvedValue({
      verified: true,
      expectedHash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      actualHash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      checkedAt: '2026-02-17T12:00:00Z',
    });
    vi.mocked(api.user.getEvidenceShares).mockResolvedValue([
      {
        id: 'share-1',
        evidenceId: 'ev-1',
        recipientId: 'lawyer-1',
        permission: 'READ_ONLY',
        status: 'ACTIVE',
        validFrom: '2026-02-01T00:00:00Z',
        validUntil: '2026-03-01T00:00:00Z',
        revokedAt: null,
        recipient: {
          id: 'lawyer-1',
          email: 'avocate@barreau.ma',
          firstName: 'Nadia',
          lastName: 'Merzoug',
          fullName: 'Me Nadia Merzoug',
          role: 'LAWYER',
        },
      },
    ]);
    vi.mocked(api.user.getEvidenceLogs).mockResolvedValue([
      {
        id: 'log-1',
        evidenceId: 'ev-1',
        userId: 'user-101',
        action: 'VIEW',
        ipAddress: '196.12.34.56',
        result: 'SUCCESS',
        metadata: { client: 'Web' },
        createdAt: '2026-02-16T15:00:00Z',
        user: {
          id: 'user-101',
          email: 'khadija@example.com',
          firstName: 'Khadija',
          lastName: 'Alaoui',
          fullName: 'Khadija Alaoui',
          role: 'USER',
        },
      },
      {
        id: 'log-2',
        evidenceId: 'ev-1',
        userId: 'lawyer-1',
        action: 'DOWNLOAD',
        ipAddress: '196.12.99.11',
        result: 'DENIED',
        metadata: { reason: 'Read only permission' },
        createdAt: '2026-02-16T16:00:00Z',
        user: {
          id: 'lawyer-1',
          email: 'avocate@barreau.ma',
          firstName: 'Nadia',
          lastName: 'Merzoug',
          fullName: 'Me Nadia Merzoug',
          role: 'LAWYER',
        },
      },
    ]);
    vi.mocked(api.user.downloadEvidenceFile).mockResolvedValue(undefined as any);
    vi.mocked(api.user.viewEvidenceBlobUrl).mockResolvedValue({
      blobUrl: 'blob:http://localhost:3000/mock-blob',
      contentType: 'image/jpeg',
    });
  });

  it('renders the evidence vault with folders and real evidence pieces', async () => {
    render(
      <LanguageProvider>
        <EvidenceVault initialEvidences={mockEvidences} />
      </LanguageProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('constat_agression.jpg')).toBeInTheDocument();
      expect(screen.getAllByText(/Violences Janvier 2026/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/SHA-256:/i)).toBeInTheDocument();
      expect(screen.getByText(/9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08/i)).toBeInTheDocument();
    });
  });

  it('verifies SHA-256 hash integrity on click', async () => {
    render(
      <LanguageProvider>
        <EvidenceVault initialEvidences={mockEvidences} />
      </LanguageProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('constat_agression.jpg')).toBeInTheDocument();
    });

    const verifyButtons = screen.getAllByTitle(/(Vérifier l'empreinte|التحقق من البصمة)/i);
    fireEvent.click(verifyButtons[0]);

    await waitFor(() => {
      expect(api.user.verifyEvidence).toHaveBeenCalledWith('ev-1');
      expect(screen.getByText(/(Intégrité cryptographique confirmée|تم تأكيد سلامة البصمة المشفرة)/i)).toBeInTheDocument();
    });
  });

  it('opens and submits new folder modal', async () => {
    render(
      <LanguageProvider>
        <EvidenceVault initialEvidences={mockEvidences} />
      </LanguageProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('constat_agression.jpg')).toBeInTheDocument();
    });

    const newFolderButton = screen.getByText(/(Nouveau dossier|مجلد جديد)/i);
    fireEvent.click(newFolderButton);

    const folderNameInput = screen.getByPlaceholderText(/Ex: Procédure 2026/i);
    fireEvent.change(folderNameInput, { target: { value: 'Dossier Tribunal 2026' } });

    const submitButtons = screen.getAllByText(/(Nouveau dossier|مجلد جديد)/i);
    fireEvent.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(api.user.createEvidenceFolder).toHaveBeenCalledWith({
        name: 'Dossier Tribunal 2026',
        description: undefined,
      });
    });
  });

  it('opens share modal and displays active permissions and form', async () => {
    render(
      <LanguageProvider>
        <EvidenceVault initialEvidences={mockEvidences} />
      </LanguageProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('constat_agression.jpg')).toBeInTheDocument();
    });

    const shareButton = screen.getByTitle(/(Partager|مشاركة)/i);
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(api.user.getEvidenceShares).toHaveBeenCalledWith('ev-1');
      expect(screen.getByText('avocate@barreau.ma')).toBeInTheDocument();
      expect(screen.getByText(/(Révoquer l'accès|إلغاء الصلاحية فوراً)/i)).toBeInTheDocument();
    });

    const emailInput = screen.getByPlaceholderText(/avocate@barreau.ma/i);
    fireEvent.change(emailInput, { target: { value: 'psy@soutien.ma' } });

    const grantButton = screen.getByText(/(Accorder l’accès sécurisé|منح صلاحية المشاركة)/i);
    fireEvent.click(grantButton);

    await waitFor(() => {
      expect(api.user.createEvidenceShare).toHaveBeenCalledWith('ev-1', {
        recipientEmail: 'psy@soutien.ma',
        permission: 'READ_ONLY',
        validDays: 14,
      });
    });
  });

  it('opens access logs modal and displays audit trail with IP and DENIED status', async () => {
    render(
      <LanguageProvider>
        <EvidenceVault initialEvidences={mockEvidences} />
      </LanguageProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('constat_agression.jpg')).toBeInTheDocument();
    });

    const logsButton = screen.getByTitle(/(Journal de traçabilité|سجل التتبع والمطالعة)/i);
    fireEvent.click(logsButton);

    await waitFor(() => {
      expect(api.user.getEvidenceLogs).toHaveBeenCalledWith('ev-1');
      expect(screen.getByText(/(Historique d'accès et chaîne de traçabilité|سجل الوصول والشفافية وتتبع العمليات)/i)).toBeInTheDocument();
      expect(screen.getByText(/196.12.34.56/)).toBeInTheDocument();
      expect(screen.getByText('DENIED')).toBeInTheDocument();
      expect(screen.getByText('SUCCESS')).toBeInTheDocument();
    });
  });

  it('triggers secure in-app document preview and download', async () => {
    render(
      <LanguageProvider>
        <EvidenceVault initialEvidences={mockEvidences} />
      </LanguageProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('constat_agression.jpg')).toBeInTheDocument();
    });

    const viewButton = screen.getByTitle(/(Consulter|معاينة)/i);
    fireEvent.click(viewButton);

    await waitFor(() => {
      expect(api.user.viewEvidenceBlobUrl).toHaveBeenCalledWith('ev-1');
      expect(screen.getByAltText('constat_agression.jpg')).toBeInTheDocument();
    });

    const downloadButton = screen.getByTitle(/(Télécharger|تحميل)/i);
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(api.user.downloadEvidenceFile).toHaveBeenCalledWith('ev-1', 'constat_agression.jpg');
    });
  });

  it('displays pieces shared with the user in the "Partagés avec moi" tab', async () => {
    render(
      <LanguageProvider>
        <EvidenceVault initialEvidences={mockEvidences} />
      </LanguageProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('constat_agression.jpg')).toBeInTheDocument();
    });

    const sharedTabButton = screen.getByText(/(Partagés avec moi|أدلة تمت مشاركتها معي)/i);
    fireEvent.click(sharedTabButton);

    await waitFor(() => {
      expect(screen.getByText('rapport_medical_partage.pdf')).toBeInTheDocument();
      expect(screen.getByText(/Aicha Tazi/i)).toBeInTheDocument();
      expect(screen.getByText(/(Consultation seule|اطلاع وقراءة آمنة فقط)/i)).toBeInTheDocument();
    });
  });
});
