import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AiAssistantPage from '../app/ai/page';
import { LanguageProvider } from '../i18n/context';
import * as authContextModule from '../context/auth-context';
import { api } from '../lib/api';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/ai',
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
}));

vi.mock('../lib/api', () => ({
  api: {
    ai: {
      getStatus: vi.fn(),
      getLegalCorpus: vi.fn(),
      generate: vi.fn(),
      createConversation: vi.fn(),
      getConversations: vi.fn(),
      getConversation: vi.fn(),
      deleteConversation: vi.fn(),
      sendMessage: vi.fn(),
    },
  },
}));

describe('SANAD AI Assistant - Frontend', () => {
  const mockUser = {
    id: 'user-456',
    email: 'citoyenne@example.ma',
    firstName: 'Khadija',
    role: 'USER',
    preferredLanguage: 'ar',
    isEmailVerified: true,
  };

  const mockLegalCorpus = [
    {
      code: 'LOI_103_13',
      article: 'Loi n° 103-13, Articles 1 à 5',
      titleFr: 'Lutte contre les violences faites aux femmes',
      titleAr: 'القانون رقم 103-13 — محاربة العنف ضد النساء',
      summaryFr: 'Définit et réprime sévèrement les violences physiques et psychologiques.',
      summaryAr: 'يُجرّم ويعاقب على العنف الجسدي والنفسي ضد النساء.',
      summaryDarija: 'القانون كيعاقب على أي ضرب وإهانة من طرف الراجل.',
      officialSource: 'Bulletin Officiel n° 6655 du 12 mars 2018',
      keywords: ['violence', 'عنف', 'ضرب'],
    },
    {
      code: 'CPP_82_5',
      article: 'Code de Procédure Pénale, Article 82-5-1',
      titleFr: 'Ordonnances de protection et éloignement',
      titleAr: 'أوامر الحماية وتدبير إبعاد المعتدي',
      summaryFr: 'Expulsion immédiate du conjoint violent du domicile conjugal.',
      summaryAr: 'إصدار أمر فوري بإبعاد المعتدي عن بيت الزوجية.',
      summaryDarija: 'إخراج الراجل من الدار بأمر وكيل الملك.',
      officialSource: 'Modifié par la Loi n° 103-13',
      keywords: ['protection', 'حماية', 'إبعاد'],
    },
  ];

  const mockConversation = {
    id: 'conv-1',
    userId: 'user-456',
    title: 'Consultation ordonnance de protection',
    language: 'darija',
    createdAt: '2026-02-17T10:00:00Z',
    updatedAt: '2026-02-17T10:05:00Z',
    messages: [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        content: 'شنو ندير دابا راجلي كيهددني باغي يجري عليا ؟',
        senderType: 'USER' as const,
        isDangerAlert: false,
        createdAt: '2026-02-17T10:00:00Z',
      },
      {
        id: 'msg-2',
        conversationId: 'conv-1',
        content:
          'أختي الكريمة، القانون 103-13 ومدونة الأسرة كيحميوكِ. عندك الحق تطلبي أمر إبعاد المعتدي عن بيت الزوجية (المادة 82-5 من المسطرة الجنائية).',
        senderType: 'ASSISTANT' as const,
        isDangerAlert: false,
        legalReferences: [mockLegalCorpus[0], mockLegalCorpus[1]],
        createdAt: '2026-02-17T10:01:00Z',
      },
    ],
  };

  const mockConversationListItem = {
    id: 'conv-1',
    title: 'Consultation ordonnance de protection',
    language: 'darija',
    createdAt: '2026-02-17T10:00:00Z',
    updatedAt: '2026-02-17T10:05:00Z',
    messageCount: 2,
    lastMessage: null,
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

    vi.mocked(api.ai.getLegalCorpus).mockResolvedValue({
      resources: mockLegalCorpus,
      timestamp: '2026-02-17T10:00:00Z',
    });
    vi.mocked(api.ai.getConversations).mockResolvedValue([mockConversationListItem]);
    vi.mocked(api.ai.getConversation).mockResolvedValue(mockConversation);
    vi.mocked(api.ai.createConversation).mockResolvedValue(mockConversation);
  });

  it('renders the AI assistant page with ethical disclaimer and 1919 hotline', async () => {
    render(
      <LanguageProvider>
        <AiAssistantPage />
      </LanguageProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getAllByText(/مساعد سَنَد الذكي|Assistant Intelligent SANAD/i).length,
      ).toBeGreaterThan(0);
    });

    expect(screen.getAllByText(/1919/i).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/لا تعوض بأي حال الاستشارة المباشرة|ne remplace en aucun cas/i).length,
    ).toBeGreaterThan(0);
  });

  it('supports Moroccan Darija, Standard Arabic and French language selection', async () => {
    render(
      <LanguageProvider>
        <AiAssistantPage />
      </LanguageProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('الدارجة المغربية')).toBeInTheDocument();
      expect(screen.getByText('العربية')).toBeInTheDocument();
      expect(screen.getByText('Français')).toBeInTheDocument();
    });

    // Switch to French language preference
    const frButton = screen.getByText('Français');
    fireEvent.click(frButton);

    expect(frButton).toHaveClass('bg-[#5C1F75]');
  });

  it('displays verified Moroccan legal references attached to assistant responses', async () => {
    render(
      <LanguageProvider>
        <AiAssistantPage />
      </LanguageProvider>,
    );

    await waitFor(() => {
      expect(screen.getAllByText(/103-13/i).length).toBeGreaterThan(0);
    });

    expect(screen.getByText(/المادة 82-5/i)).toBeInTheDocument();
  });

  it('triggers and displays safety alert banner when danger is detected', async () => {
    const dangerMsg = {
      id: 'msg-danger',
      conversationId: 'conv-1',
      content: '🚨 إنذار أمني عاجل: سلامتكِ الجسدية في خطر مباشر. اتصلي فوراً بـ 1919 أو الشرطة 19.',
      senderType: 'ASSISTANT' as const,
      isDangerAlert: true,
      legalReferences: [mockLegalCorpus[0]],
      createdAt: '2026-02-17T10:02:00Z',
    };

    vi.mocked(api.ai.getConversation).mockResolvedValue({
      ...mockConversation,
      messages: [...mockConversation.messages, dangerMsg],
    });

    render(
      <LanguageProvider>
        <AiAssistantPage />
      </LanguageProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getAllByText(/إنذار خطر مباشر|DANGER IMMÉDIAT DÉTECTÉ/i).length,
      ).toBeGreaterThan(0);
    });

    expect(screen.getAllByText(/Police|الشرطة/i).length).toBeGreaterThan(0);
  });

  it('opens verified legal corpus modal with Dahir / Bulletin Officiel citations', async () => {
    render(
      <LanguageProvider>
        <AiAssistantPage />
      </LanguageProvider>,
    );

    // Open legal modal
    const legalButton = screen.getByRole('button', {
      name: /النصوص القانونية|textes de loi/i,
    });
    fireEvent.click(legalButton);

    await waitFor(() => {
      expect(
        screen.getByText(/النصوص القانونية المغربية المعتمدة|Textes légaux marocains vérifiés/i),
      ).toBeInTheDocument();
      expect(screen.getAllByText(/Bulletin Officiel n° 6655/i).length).toBeGreaterThan(0);
    });
  });
});
