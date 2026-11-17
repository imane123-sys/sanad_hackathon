import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { CreateAssistanceRequestDto } from './dto/create-assistance-request.dto';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import {
  AssistanceStatus,
  ConsentType,
  EvidenceAction,
  EvidenceStatus,
  LogResult,
  NotificationChannel,
  NotificationType,
  SessionStatus,
  VerificationStatus,
} from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  private serializeEvidence(evidence: any) {
    if (!evidence) return null;
    return {
      ...evidence,
      size: typeof evidence.size === 'bigint' ? Number(evidence.size) : evidence.size,
    };
  }

  async getDashboard(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        fullName: true,
        phone: true,
        role: true,
        status: true,
        isEmailVerified: true,
        preferredLanguage: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const [
      evidenceCount,
      activeRequestsCount,
      unreadNotificationsCount,
      activeSessionsCount,
      recentEvidencesRaw,
      recentRequests,
      recentNotifications,
      emergencyHelplines,
    ] = await Promise.all([
      this.prisma.evidence.count({ where: { userId } }),
      this.prisma.assistanceRequest.count({
        where: {
          userId,
          status: { in: [AssistanceStatus.EN_ATTENTE, AssistanceStatus.EN_COURS] },
        },
      }),
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
      this.prisma.userSession.count({
        where: { userId, status: SessionStatus.ACTIVE },
      }),
      this.prisma.evidence.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          folder: { select: { id: true, name: true } },
          _count: { select: { accessLogs: true, sharePermissions: true } },
        },
      }),
      this.prisma.assistanceRequest.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          professional: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  fullName: true,
                  phone: true,
                },
              },
            },
          },
          statusHistory: {
            orderBy: { changedAt: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.emergencyResource.findMany({
        where: { isActive: true },
        take: 4,
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const recentEvidences = recentEvidencesRaw.map((e) => this.serializeEvidence(e));

    return {
      user,
      metrics: {
        evidenceCount,
        activeRequestsCount,
        unreadNotificationsCount,
        activeSessionsCount,
      },
      recentEvidences,
      recentRequests,
      recentNotifications,
      emergencyHelplines,
      timestamp: new Date().toISOString(),
    };
  }

  async getEvidences(userId: string) {
    const evidences = await this.prisma.evidence.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        folder: { select: { id: true, name: true } },
        _count: { select: { accessLogs: true, sharePermissions: true } },
      },
    });

    return evidences.map((e) => this.serializeEvidence(e));
  }

  async createEvidence(userId: string, dto: CreateEvidenceDto, ipAddress?: string) {
    const evidence = await this.prisma.evidence.create({
      data: {
        userId,
        folderId: dto.folderId || null,
        fileName: dto.fileName,
        fileUrl: dto.fileUrl,
        mimeType: dto.mimeType,
        size: BigInt(dto.size),
        sha256: dto.sha256,
        description: dto.description || null,
        status: EvidenceStatus.STORED,
      },
      include: {
        folder: { select: { id: true, name: true } },
      },
    });

    await this.prisma.evidenceAccessLog.create({
      data: {
        evidenceId: evidence.id,
        userId,
        action: EvidenceAction.VERIFY_HASH,
        ipAddress: ipAddress || '127.0.0.1',
        result: LogResult.SUCCESS,
        metadata: {
          fileName: dto.fileName,
          size: dto.size,
          sha256: dto.sha256,
        },
      },
    });

    return this.serializeEvidence(evidence);
  }

  async deleteEvidence(userId: string, evidenceId: string) {
    const evidence = await this.prisma.evidence.findUnique({
      where: { id: evidenceId },
    });

    if (!evidence) {
      throw new NotFoundException('Élément de preuve introuvable');
    }

    if (evidence.userId !== userId) {
      throw new ForbiddenException('Accès non autorisé à cet élément');
    }

    await this.prisma.evidence.delete({
      where: { id: evidenceId },
    });

    return { success: true, message: 'Élément de preuve supprimé en toute sécurité' };
  }

  async getAssistanceRequests(userId: string) {
    return this.prisma.assistanceRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        professional: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                fullName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        statusHistory: {
          orderBy: { changedAt: 'desc' },
          include: {
            changedBy: {
              select: {
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
      },
    });
  }

  async createAssistanceRequest(userId: string, dto: CreateAssistanceRequestDto) {
    const request = await this.prisma.assistanceRequest.create({
      data: {
        userId,
        typeAssistance: dto.typeAssistance,
        description: dto.description || null,
        professionalId: dto.professionalId || null,
        organizationId: dto.organizationId || null,
        status: AssistanceStatus.EN_ATTENTE,
      },
      include: {
        professional: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    await this.prisma.assistanceStatusHistory.create({
      data: {
        assistanceRequestId: request.id,
        newStatus: AssistanceStatus.EN_ATTENTE,
        changedById: userId,
        comment: 'Demande soumise par l’utilisatrice dans son espace sécurisé',
      },
    });

    // Create discreet confirmation notification
    await this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.ASSISTANCE_REQUEST,
        channel: NotificationChannel.IN_APP,
        neutralContent: 'Votre démarche d’assistance a été enregistrée avec succès.',
        isRead: false,
      },
    });

    return request;
  }

  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markNotificationRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification introuvable');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllNotificationsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { success: true };
  }

  async getAnalysisResults(userId: string) {
    return this.prisma.analysisResult.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        consent: {
          select: {
            policyVersion: true,
            grantedAt: true,
          },
        },
      },
    });
  }

  async createAnalysis(userId: string, dto: CreateAnalysisDto) {
    let consent = await this.prisma.consent.findFirst({
      where: {
        userId,
        consentType: ConsentType.AI_SITUATION_ANALYSIS,
      },
    });

    if (!consent) {
      consent = await this.prisma.consent.create({
        data: {
          userId,
          consentType: ConsentType.AI_SITUATION_ANALYSIS,
          isGranted: true,
          policyVersion: 'v2.0',
        },
      });
    }

    return this.prisma.analysisResult.create({
      data: {
        userId,
        consentId: consent.id,
        analysisContent: dto.analysisContent,
      },
    });
  }

  async getResources(filters?: { city?: string; category?: string; query?: string }) {
    const [professionals, helpCenters, emergencyResources, legalResources] =
      await Promise.all([
        this.prisma.professional.findMany({
          where: {
            verificationStatus: VerificationStatus.VERIFIED,
            ...(filters?.city ? { city: { contains: filters.city } } : {}),
          },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                fullName: true,
                email: true,
                phone: true,
              },
            },
            services: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.helpCenter.findMany({
          where: {
            isVerified: true,
            ...(filters?.city ? { city: { contains: filters.city } } : {}),
          },
          orderBy: { city: 'asc' },
        }),
        this.prisma.emergencyResource.findMany({
          where: { isActive: true },
          orderBy: { serviceType: 'asc' },
        }),
        this.prisma.legalResource.findMany({
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

    return {
      professionals,
      helpCenters,
      emergencyResources,
      legalResources,
      timestamp: new Date().toISOString(),
    };
  }
}
