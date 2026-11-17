import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { GeminiProvider } from './providers/gemini.provider';
import { PiiSanitizer } from './utils/pii-sanitizer';
import { SensitiveSituationDetector } from './utils/danger-detector';
import { MessageSender } from '@prisma/client';

describe('AiService & Safeguards', () => {
  let service: AiService;
  let prisma: PrismaService;
  let geminiProvider: GeminiProvider;

  const mockPrisma = {
    conversation: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    message: {
      create: jest.fn(),
      count: jest.fn(),
    },
    aiInteraction: {
      create: jest.fn(),
    },
    legalResource: {
      findMany: jest.fn(),
    },
  };

  const mockGeminiProvider = {
    providerName: 'gemini',
    generateText: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      if (key === 'AI_PROVIDER') return 'gemini';
      if (key === 'AI_MODEL') return 'gemini-1.5-pro';
      return defaultValue;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: GeminiProvider, useValue: mockGeminiProvider },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    prisma = module.get<PrismaService>(PrismaService);
    geminiProvider = module.get<GeminiProvider>(GeminiProvider);
  });

  describe('PII Sanitizer (Data Minimization)', () => {
    it('should redact Moroccan CIN numbers before forwarding to provider', () => {
      const input = 'Mon numéro de CIN est AB123456 et je subis des violences.';
      const result = PiiSanitizer.sanitize(input);

      expect(result.hasRedactions).toBe(true);
      expect(result.redactedTypes).toContain('CIN');
      expect(result.sanitizedText).not.toContain('AB123456');
      expect(result.sanitizedText).toContain('[CIN_CONFIDENTIEL]');
    });

    it('should redact Moroccan phone numbers and email addresses', () => {
      const input = 'Appelez-moi au +212612345678 ou contact@exemple.ma pour mon dossier.';
      const result = PiiSanitizer.sanitize(input);

      expect(result.hasRedactions).toBe(true);
      expect(result.redactedTypes).toContain('PHONE');
      expect(result.redactedTypes).toContain('EMAIL');
      expect(result.sanitizedText).not.toContain('+212612345678');
      expect(result.sanitizedText).not.toContain('contact@exemple.ma');
    });
  });

  describe('Sensitive Situation & Danger Detection', () => {
    it('should detect critical danger in Moroccan Darija (weapons & death threats)', () => {
      const darijaPrompt = 'راجلي باغي يقتلني وكيهددني بالموس دابا ف الدار عتقوني';
      const assessment = SensitiveSituationDetector.assess(darijaPrompt);

      expect(assessment.isDangerAlert).toBe(true);
      expect(assessment.dangerLevel).toBe('CRITICAL');
      expect(assessment.detectedRisks).toContain('IMMINENT_PHYSICAL_DANGER');
      expect(assessment.emergencyOrientation.darija).toContain('1919');
      expect(assessment.recommendedHelplines.some((h) => h.number === '1919')).toBe(true);
      expect(assessment.recommendedHelplines.some((h) => h.number === '19')).toBe(true);
    });

    it('should detect critical danger in Standard Arabic', () => {
      const arabicPrompt = 'زوجي يهددني بالقتل ويحمل سلاحا أبيض في المنزل وأنا في خطر';
      const assessment = SensitiveSituationDetector.assess(arabicPrompt);

      expect(assessment.isDangerAlert).toBe(true);
      expect(assessment.dangerLevel).toBe('CRITICAL');
      expect(assessment.emergencyOrientation.ar).toContain('1919');
    });

    it('should detect critical danger in French', () => {
      const frenchPrompt = 'Au secours, il menace de me tuer et je suis séquestrée dans la chambre';
      const assessment = SensitiveSituationDetector.assess(frenchPrompt);

      expect(assessment.isDangerAlert).toBe(true);
      expect(assessment.dangerLevel).toBe('CRITICAL');
      expect(assessment.emergencyOrientation.fr).toContain('Police Secours (19)');
    });

    it('should return clean assessment for routine legal questions', () => {
      const safePrompt = 'Comment calculer la pension alimentaire pour deux enfants mineurs au Maroc ?';
      const assessment = SensitiveSituationDetector.assess(safePrompt);

      expect(assessment.isDangerAlert).toBe(false);
      expect(assessment.dangerLevel).toBe('NONE');
    });
  });

  describe('Language Detection & Legal Matching', () => {
    it('should recognize Moroccan Darija expressions', () => {
      expect(service.detectLanguage('شنو ندير دابا راجلي كيهددني')).toBe('darija');
      expect(service.detectLanguage('واش كاين محامي فابور عافاك')).toBe('darija');
    });

    it('should recognize Standard Arabic and French', () => {
      expect(service.detectLanguage('ما هي إجراءات التطليق للضرر وفق مدونة الأسرة؟')).toBe('ar');
      expect(service.detectLanguage('Quelles sont les démarches pour obtenir une ordonnance d’éloignement ?')).toBe('fr');
    });

    it('should match verified Moroccan legal references without fabrication', () => {
      const refs = service.matchLegalReferences('chantage avec mes photos sur whatsapp');
      expect(refs.some((r) => r.code === 'PENAL_447')).toBe(true);
      expect(refs[0].officialSource).toBeDefined();
    });
  });

  describe('Conversation Management & Messaging', () => {
    it('should create a new conversation thread in MySQL', async () => {
      const mockCreated = {
        id: 'conv-101',
        userId: 'user-123',
        title: 'استشارة حماية',
        language: 'ar',
        messages: [],
      };
      mockPrisma.conversation.create.mockResolvedValue(mockCreated);

      const conv = await service.createConversation('user-123', 'استشارة حماية', 'ar');
      expect(mockPrisma.conversation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-123',
          title: 'استشارة حماية',
          language: 'ar',
        }),
        include: { messages: true },
      });
      expect(conv.id).toBe('conv-101');
    });

    it('should send a message, detect danger, ground in law, and persist to database', async () => {
      mockPrisma.conversation.findUnique.mockResolvedValue({
        id: 'conv-101',
        userId: 'user-123',
        language: 'darija',
        deletedAt: null,
      });

      mockPrisma.message.create
        .mockResolvedValueOnce({
          id: 'msg-user-1',
          conversationId: 'conv-101',
          senderType: MessageSender.USER,
          createdAt: new Date(),
        })
        .mockResolvedValueOnce({
          id: 'msg-assistant-1',
          conversationId: 'conv-101',
          senderType: MessageSender.ASSISTANT,
          createdAt: new Date(),
        });

      mockPrisma.message.count.mockResolvedValue(2);
      mockPrisma.conversation.update.mockResolvedValue({});
      mockPrisma.aiInteraction.create.mockResolvedValue({});

      mockGeminiProvider.generateText.mockResolvedValue({
        text: 'أختي الكريمة، سلامتك هي الأولى. اتصلي دابا بـ 1919 أو البوليس 19. القانون 103-13 كيحميكِ.',
        provider: 'gemini',
        model: 'gemini-1.5-pro',
      });

      const response = await service.sendMessage(
        'conv-101',
        { content: 'باغي يقتلني بالموس عتقوني دابا' },
        'user-123',
      );

      expect(response.isDangerAlert).toBe(true);
      expect(response.dangerAssessment?.dangerLevel).toBe('CRITICAL');
      expect(response.legalReferences.length).toBeGreaterThan(0);
      expect(response.disclaimer).toHaveProperty('darija');
      expect(mockPrisma.message.create).toHaveBeenCalledTimes(2);
    });

    it('should provide grounded fallback response when AI provider is unconfigured or fails', async () => {
      mockPrisma.conversation.findUnique.mockResolvedValue({
        id: 'conv-101',
        userId: 'user-123',
        language: 'fr',
        deletedAt: null,
      });

      mockPrisma.message.create
        .mockResolvedValueOnce({ id: 'msg-1', createdAt: new Date() })
        .mockResolvedValueOnce({ id: 'msg-2', createdAt: new Date() });

      mockPrisma.message.count.mockResolvedValue(2);
      mockPrisma.conversation.update.mockResolvedValue({});

      // Provider throws error (e.g. invalid API key)
      mockGeminiProvider.generateText.mockRejectedValue(new Error('API_KEY_INVALID'));

      const response = await service.sendMessage(
        'conv-101',
        { content: 'Comment demander l’éloignement de mon conjoint violent ?' },
        'user-123',
      );

      expect(response.provider).toBe('sanad-sovereign-legal-engine');
      expect(response.content).toContain('1919');
      expect(response.legalReferences.length).toBeGreaterThan(0);
      expect(response.content).toContain('Code de Procédure Pénale');
    });
  });
});
