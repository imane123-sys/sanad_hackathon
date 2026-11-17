import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { GeminiProvider } from './providers/gemini.provider';
import { AiProvider } from './interfaces/ai-provider.interface';
import { GeneratePromptDto, GeneratePromptResponseDto } from './dto/prompt.dto';
import { CreateConversationDto, SendMessageDto } from './dto/conversation.dto';
import { PiiSanitizer } from './utils/pii-sanitizer';
import {
  SensitiveSituationDetector,
  DangerAssessment,
} from './utils/danger-detector';
import {
  MOROCCAN_LEGAL_CORPUS,
  LegalArticleReference,
} from './knowledge/moroccan-legal-corpus';
import { MessageSender } from '@prisma/client';

export interface AssistantMessageResponse {
  messageId: string;
  conversationId: string;
  senderType: MessageSender;
  content: string;
  isDangerAlert: boolean;
  dangerAssessment?: DangerAssessment;
  legalReferences: LegalArticleReference[];
  disclaimer: {
    fr: string;
    ar: string;
    darija: string;
  };
  provider: string;
  model: string;
  createdAt: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private currentProvider: AiProvider;

  // Trilingual Darija language markers
  private static readonly DARIJA_MARKERS = [
    'دابا',
    'ديال',
    'عافاك',
    'شنو',
    'كيهددني',
    'ماشي',
    'واش',
    'بزاف',
    'كيعنفني',
    'الدار',
    'حابسني',
    'سلخني',
    'ولادي',
    'الراجل',
    'بغيت',
    'نخرج',
    'فابور',
    'فلوس',
    'كيبتزني',
    'غادي',
  ];

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly geminiProvider: GeminiProvider,
  ) {
    const configuredProvider = this.configService
      .get<string>('AI_PROVIDER', 'gemini')
      .toLowerCase();
    switch (configuredProvider) {
      case 'gemini':
      default:
        this.currentProvider = this.geminiProvider;
        break;
    }
    this.logger.log(
      `SANAD AI service configured with active provider: ${this.currentProvider.providerName}`,
    );
  }

  getProviderName(): string {
    return this.currentProvider.providerName;
  }

  /**
   * Detects whether user text is Moroccan Darija, Standard Arabic, or French.
   */
  detectLanguage(text: string, requestedLang?: string): 'darija' | 'ar' | 'fr' {
    if (requestedLang) {
      const lower = requestedLang.toLowerCase();
      if (lower === 'darija') return 'darija';
      if (lower === 'fr' || lower === 'french') return 'fr';
      if (lower === 'ar' || lower === 'arabic') return 'ar';
    }

    const hasArabicChars = /[\u0600-\u06FF]/.test(text);

    if (hasArabicChars) {
      for (const marker of AiService.DARIJA_MARKERS) {
        if (text.includes(marker)) {
          return 'darija';
        }
      }
      return 'ar';
    }

    return 'fr';
  }

  /**
   * Matches verified legal articles from the Moroccan legal corpus based on query semantics and keywords.
   */
  matchLegalReferences(query: string): LegalArticleReference[] {
    const lower = query.toLowerCase();
    const matched: LegalArticleReference[] = [];

    for (const article of MOROCCAN_LEGAL_CORPUS) {
      const isMatch = article.keywords.some((kw) => lower.includes(kw.toLowerCase()));
      if (isMatch) {
        matched.push(article);
      }
    }

    // Default to Loi 103-13 and Ordonnance de Protection if no specific match
    if (matched.length === 0) {
      matched.push(MOROCCAN_LEGAL_CORPUS[0]); // Loi 103-13
      matched.push(MOROCCAN_LEGAL_CORPUS[1]); // CPP 82-5 Ordonnance de protection
    }

    return matched.slice(0, 3);
  }

  /**
   * Builds strict system instruction for the LLM enforcing Moroccan law, confidentiality, and anti-hallucination.
   */
  private buildSystemInstruction(
    lang: 'darija' | 'ar' | 'fr',
    danger: DangerAssessment,
    legalRefs: LegalArticleReference[],
  ): string {
    const legalContext = legalRefs
      .map(
        (ref) =>
          `[RÉFÉRENCE LÉGALE OFFICIELLE MAROCAINE : ${ref.article} - Source : ${ref.officialSource}]\nFR: ${ref.summaryFr}\nAR: ${ref.summaryAr}\nDARIJA: ${ref.summaryDarija}`,
      )
      .join('\n\n');

    let languageDirective = '';
    if (lang === 'darija') {
      languageDirective =
        'LANGUE : Répondez en DARIJA MAROCAINE (الدارجة المغربية) chaleureuse, empathique, respectueuse et très accessible. Utilisez des termes clairs du quotidien marocain.';
    } else if (lang === 'ar') {
      languageDirective =
        'LANGUE : Répondez en ARABE STANDARD (العربية الفصحى المبسطة) avec chaleur, clarté et bienveillance.';
    } else {
      languageDirective =
        'LANGUE : Répondez en FRANÇAIS élégant, clair, rassurant et rigoureux.';
    }

    const emergencyDirective = danger.isDangerAlert
      ? `\nURGENCE ET DANGER IMMINENT : Une situation sensible ou dangereuse a été identifiée. Mentionnez EN TOUTE PRIORITÉ les numéros d'urgence marocains : Ligne Nationale 1919 (écoute et protection), Police Secours 19, Gendarmerie Royale 177. Conseillez de se mettre à l'abri immédiatement sans confrontation.`
      : '';

    return `Vous êtes SANAD (سَنَد), l'assistante intelligente marocaine dédiée à l'écoute, au soutien et à l'orientation des femmes victimes de violence ou en détresse, dans le strict respect de la Loi n° 09-08 (protection des données personnelles).

${languageDirective}

RÈGLES D'OR ABSOLUES :
1. APPUYEZ-VOUS STRICTEMENT SUR LES SOURCES JURIDIQUES MAROCAINES FOURNIES CI-DESSOUS. Ne fabriquez JAMAIS d'articles ou de lois imaginaires.
2. DÉCHARGE OBLIGATOIRE : Rappelez avec bienveillance que SANAD est un guide d'orientation et ne remplace pas une avocate inscrite à l'un des barreaux du Maroc, un magistrat ou un médecin.
3. EMPATHIE & BIENVEILLANCE : Écoutez sans jugement, validez le ressenti de l'utilisatrice, donnez des étapes d'action claires et rassurantes (dépôt de plainte, preuve, demande d'ordonnance d'éloignement, aide judiciaire gratuite).
${emergencyDirective}

SOURCES LÉGALES VÉRIFIÉES AU MAROC À CITER :
${legalContext}`;
  }

  /**
   * Deterministic sovereign fallback response when the external AI provider is unconfigured or unavailable.
   */
  private generateGroundedFallback(
    lang: 'darija' | 'ar' | 'fr',
    danger: DangerAssessment,
    legalRefs: LegalArticleReference[],
  ): string {
    const helplinesText =
      lang === 'darija'
        ? '\n\n📞 أرقام الطوارئ فالمغرب متاحة 24/7:\n- خط ساند والإنصات الوطني: 1919 (فابور)\n- البوليس (المدينة): 19\n- الجندارم (البادية والضواحي): 177\n- الإسعاف الطبي: 141'
        : lang === 'ar'
        ? '\n\n📞 أرقام الطوارئ الوطنية بالمغرب (مجانية 24/7):\n- الخط الوطني لمناهضة العنف ضد النساء: 1919\n- الشرطة والنجدة: 19\n- الدرك الملكي: 177\n- الإسعاف الطبي المستعجل: 141'
        : '\n\n📞 Numéros d’urgence nationaux au Maroc (gratuits 24/7) :\n- Ligne Nationale de Protection : 1919\n- Police Secours : 19\n- Gendarmerie Royale : 177\n- SAMU : 141';

    const disclaimerText =
      lang === 'darija'
        ? '\n\n⚠️ تذكير: سَنَد مساعد توجيهي واستشاري، وما كيعوضش استشارة محامية معتمدة ولا طبيبة مختصة.'
        : lang === 'ar'
        ? '\n\n⚠️ تذكير قانوني: منصة سَنَد تقدم التوجيه والإرشاد المبسط، ولا تعوض الاستشارة المباشرة لمحامية معتمدة بهيئات المحامين بالمغرب.'
        : '\n\n⚠️ Avertissement : SANAD est un service d’orientation juridique et ne se substitue pas à la consultation d’une avocate inscrite au barreau.';

    if (danger.isDangerAlert) {
      if (lang === 'darija') {
        return `🚨 ${danger.emergencyOrientation.darija}\n\nسلامتكِ هي الأولى. إلا حسيتي بالخطر فالحين، خرجي لبلاصة عامة ولا عند الجيران واتصلي دابا بالبوليس (19) ولا خط 1919.${helplinesText}\n\nوفق مقتضيات ${legalRefs[0]?.article || 'القانون 103-13'}، عندك الحق تطلبي أمر استعجالي بحمايتكِ وإبعاد المعتدي عن الدار.${disclaimerText}`;
      }
      if (lang === 'ar') {
        return `🚨 ${danger.emergencyOrientation.ar}\n\nنحثكِ على جعل سلامتكِ الجسدية الأولوية القصوى. ابتعدي فوراً عن محيط الخطر واتصلي بأرقام النجدة.${helplinesText}\n\nيضمن لكِ ${legalRefs[0]?.article || 'القانون رقم 103-13'} الحق في أمر حماية عاجل وإسقاط حق المعتدي في الاقتراب منكِ أو من أطفالكِ.${disclaimerText}`;
      }
      return `🚨 ${danger.emergencyOrientation.fr}\n\nVotre sécurité immédiate est la priorité absolue. Éloignez-vous de la source de danger et contactez sans délai les services d’intervention.${helplinesText}\n\nEn vertu de la ${legalRefs[0]?.article || 'Loi 103-13'}, vous êtes en droit de solliciter une ordonnance d’éloignement d’urgence auprès du Parquet.${disclaimerText}`;
    }

    if (lang === 'darija') {
      const summaries = legalRefs.map((r) => `• ${r.titleAr} (${r.article}):\n  ${r.summaryDarija}`).join('\n\n');
      return `أهلاً بكِ في سَنَد. حنا هنا باش نسمعوكِ ونعاونوكِ تعرفي حقوقكِ كاملة وفق القانون المغربي بكل سرية:\n\n${summaries}\n\nخطوات عملية تقدري ديريها:\n1. وثقي أي دليل (شهادة طبية، ميساجات واتساب، تسجيلات) فخزانة الأدلة هنا ف سَنَد مع البصمة الرقمية.\n2. تقدري تقدمي شكاية عند وكيل الملك فالمحكمة الابتدائية ولا فمفوضية الشرطة.\n3. عندك الحق فالمساعدة القضائية وتعيين محامية فابور إلا ما كانوش عندك فلوس.${helplinesText}${disclaimerText}`;
    }

    if (lang === 'ar') {
      const summaries = legalRefs.map((r) => `• ${r.titleAr} (${r.article}):\n  ${r.summaryAr}`).join('\n\n');
      return `مرحباً بكِ في سَنَد. نحن هنا لمؤازرتكِ وتقديم الإرشاد القانوني الدقيق وفق التشريع المغربي:\n\n${summaries}\n\nالإجراءات الموصى بها:\n1. توثيق وحفظ الأدلة والشهادات الطبية في خزانة الأدلة المؤمنة بالبصمة الرقمية SHA-256.\n2. التوجه إلى خلية التكفل بالنساء ضحايا العنف بالمحكمة الابتدائية أو مصالح الأمن الوطني والدرك الملكي.\n3. الاستفادة من المساعدة القضائية لتعيين محامٍ بالمجان دون أي صوائر.${helplinesText}${disclaimerText}`;
    }

    const summaries = legalRefs.map((r) => `• ${r.titleFr} (${r.article}):\n  ${r.summaryFr}`).join('\n\n');
    return `Bienvenue sur SANAD. Nous sommes à vos côtés pour vous informer et vous orienter avec rigueur et bienveillance selon le droit marocain :\n\n${summaries}\n\nDémarches recommandées :\n1. Consigner vos preuves (certificats médicaux, captures WhatsApp) dans votre coffre-fort numérique certifié SHA-256.\n2. Déposer plainte auprès de la cellule de prise en charge des femmes du Tribunal de Première Instance ou de la Police/Gendarmerie.\n3. Bénéficier de l’assistance juridictionnelle gratuite pour désignation d’une avocate sans frais.${helplinesText}${disclaimerText}`;
  }

  // ==========================================
  // CONVERSATION THREAD MANAGEMENT
  // ==========================================

  async createConversation(userId: string | null, title?: string, language?: string) {
    const defaultTitle =
      title || (language === 'fr' ? 'Nouvelle consultation' : 'استشارة جديدة');

    return this.prisma.conversation.create({
      data: {
        userId: userId || null,
        title: defaultTitle,
        language: language || 'ar',
      },
      include: {
        messages: true,
      },
    });
  }

  async getConversations(userId: string) {
    const list = await this.prisma.conversation.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { messages: true },
        },
      },
    });

    return list.map((c) => ({
      id: c.id,
      title: c.title,
      language: c.language,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      messageCount: c._count.messages,
      lastMessage: c.messages[0] || null,
    }));
  }

  async getConversation(conversationId: string, userId?: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation || conversation.deletedAt !== null) {
      throw new NotFoundException('Conversation introuvable ou supprimée');
    }

    if (userId && conversation.userId && conversation.userId !== userId) {
      throw new ForbiddenException('Accès refusé à cette conversation');
    }

    return conversation;
  }

  async deleteConversation(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation introuvable');
    }

    if (conversation.userId && conversation.userId !== userId) {
      throw new ForbiddenException('Accès refusé à cette conversation');
    }

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { deletedAt: new Date() },
    });

    return { success: true, message: 'Conversation supprimée en toute discrétion' };
  }

  /**
   * Sends a message within a conversation thread with PII minimization, sensitive situation detection,
   * grounded legal references, and provider invocation.
   */
  async sendMessage(
    conversationId: string,
    dto: SendMessageDto,
    userId?: string,
  ): Promise<AssistantMessageResponse> {
    const conversation = await this.getConversation(conversationId, userId);

    // 1. Detect language (French, Arabic, or Moroccan Darija)
    const detectedLang = this.detectLanguage(dto.content, dto.language || conversation.language);

    // 2. Sensitive situation and danger assessment
    const dangerAssessment = SensitiveSituationDetector.assess(dto.content);

    // 3. Match grounded Moroccan legal references
    const matchedLegal = this.matchLegalReferences(dto.content);

    // 4. Save User Message in MySQL
    await this.prisma.message.create({
      data: {
        conversationId,
        content: dto.content,
        senderType: MessageSender.USER,
        isDangerAlert: dangerAssessment.isDangerAlert,
      },
    });

    // 5. Minimize PII before forwarding prompt to AI provider
    const sanitized = PiiSanitizer.sanitize(dto.content);

    // 6. Build safe system instruction
    const systemInstruction = this.buildSystemInstruction(
      detectedLang,
      dangerAssessment,
      matchedLegal,
    );

    let assistantText = '';
    let usedProvider = this.currentProvider.providerName;
    let usedModel = this.configService.get<string>('AI_MODEL', 'gemini-1.5-pro');

    // 7. Call active AI provider SDK with fallback resilience
    try {
      const aiResult = await this.currentProvider.generateText({
        prompt: sanitized.sanitizedText,
        systemInstruction,
        temperature: 0.5,
      });

      assistantText = aiResult.text;
      usedProvider = aiResult.provider;
      usedModel = aiResult.model;
    } catch (providerError) {
      this.logger.warn(
        `AI provider call failed (${(providerError as Error).message}), switching to grounded sovereign fallback.`,
      );
      assistantText = this.generateGroundedFallback(
        detectedLang,
        dangerAssessment,
        matchedLegal,
      );
      usedProvider = 'sanad-sovereign-legal-engine';
    }

    // 8. Save Assistant Message in MySQL
    const savedAssistantMsg = await this.prisma.message.create({
      data: {
        conversationId,
        content: assistantText,
        senderType: MessageSender.ASSISTANT,
        isDangerAlert: dangerAssessment.isDangerAlert,
        legalReferences: matchedLegal as any,
      },
    });

    // 9. Update conversation timestamp and title if first user message
    const msgCount = await this.prisma.message.count({ where: { conversationId } });
    const updateData: any = { updatedAt: new Date() };
    if (msgCount <= 2 && dto.content.trim().length > 0) {
      updateData.title = dto.content.slice(0, 50).trim() + (dto.content.length > 50 ? '...' : '');
    }
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: updateData,
    });

    // 10. Best-effort AI interaction audit logging
    try {
      await this.prisma.aiInteraction.create({
        data: {
          userId: userId || null,
          provider: usedProvider,
          model: usedModel,
          prompt: sanitized.sanitizedText,
          response: assistantText,
          status: 'SUCCESS',
        },
      });
    } catch (auditErr) {
      // ignore audit log failure
    }

    return {
      messageId: savedAssistantMsg.id,
      conversationId,
      senderType: MessageSender.ASSISTANT,
      content: assistantText,
      isDangerAlert: dangerAssessment.isDangerAlert,
      dangerAssessment: dangerAssessment.isDangerAlert ? dangerAssessment : undefined,
      legalReferences: matchedLegal,
      disclaimer: {
        fr: 'SANAD est un guide d’orientation juridique et ne remplace pas une avocate ou un médecin.',
        ar: 'سَنَد مساعد توجيهي واستشاري، ولا يعوض بأي حال استشارة محامية معتمدة أو طبيبة مختصة.',
        darija: 'سَنَد كيوجهكِ ويعاونكِ، ولكن ما كيعوضش محامية ولا طبيبة.',
      },
      provider: usedProvider,
      model: usedModel,
      createdAt: savedAssistantMsg.createdAt.toISOString(),
    };
  }

  /**
   * Backwards-compatible prompt generation (for situation analysis or quick queries),
   * enriched with PII sanitization, danger detection, and Moroccan legal grounding.
   */
  async generate(dto: GeneratePromptDto): Promise<GeneratePromptResponseDto> {
    const startTime = Date.now();
    const sanitized = PiiSanitizer.sanitize(dto.prompt);
    const danger = SensitiveSituationDetector.assess(dto.prompt);
    const matchedLegal = this.matchLegalReferences(dto.prompt);
    const detectedLang = this.detectLanguage(dto.prompt);

    const safeInstruction =
      dto.systemInstruction ||
      this.buildSystemInstruction(detectedLang, danger, matchedLegal);

    let interactionRecordId: string | undefined;

    try {
      const result = await this.currentProvider.generateText({
        prompt: sanitized.sanitizedText,
        systemInstruction: safeInstruction,
        temperature: dto.temperature,
      });

      try {
        const record = await this.prisma.aiInteraction.create({
          data: {
            userId: dto.userId || null,
            provider: result.provider,
            model: result.model,
            prompt: sanitized.sanitizedText,
            response: result.text,
            status: 'SUCCESS',
            tokensUsed: result.tokensUsed,
          },
        });
        interactionRecordId = record.id;
      } catch (dbErr) {
        // ignore
      }

      return {
        text: result.text,
        provider: result.provider,
        model: result.model,
        tokensUsed: result.tokensUsed,
        interactionId: interactionRecordId,
      };
    } catch (error) {
      // Return grounded sovereign fallback instead of throwing error when key is unconfigured
      const fallbackText = this.generateGroundedFallback(
        detectedLang,
        danger,
        matchedLegal,
      );

      return {
        text: fallbackText,
        provider: 'sanad-sovereign-legal-engine',
        model: 'moroccan-legal-corpus-v2',
      };
    }
  }

  /**
   * Returns verified Moroccan legal references catalog.
   */
  getLegalCorpus(): LegalArticleReference[] {
    return MOROCCAN_LEGAL_CORPUS;
  }
}
