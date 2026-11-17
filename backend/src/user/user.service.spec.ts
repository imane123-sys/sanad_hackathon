import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import {
  AssistanceStatus,
  AssistanceType,
  ConsentType,
  EvidenceAction,
  EvidenceStatus,
  Role,
  SharePermissionType,
  ShareStatus,
  VerificationStatus,
} from '@prisma/client';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'user-123',
    email: 'citoyenne@example.com',
    firstName: 'Fatima',
    lastName: 'Zahra',
    fullName: 'Fatima Zahra',
    phone: '+212600000000',
    role: Role.USER,
    status: 'ACTIVE',
    isEmailVerified: true,
    preferredLanguage: 'ar',
    createdAt: new Date('2026-01-01T00:00:00Z'),
  };

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
    evidence: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    evidenceFolder: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    evidenceSharePermission: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    evidenceAccessLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    assistanceRequest: {
      count: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    assistanceStatusHistory: {
      create: jest.fn(),
    },
    notification: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    userSession: {
      count: jest.fn(),
    },
    consent: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    consentHistory: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    analysisResult: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    emergencyResource: {
      findMany: jest.fn(),
    },
    legalResource: {
      findMany: jest.fn(),
    },
    professional: {
      findMany: jest.fn(),
    },
    helpCenter: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getDashboard', () => {
    it('should return aggregated dashboard data for authenticated user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.evidence.count.mockResolvedValue(3);
      mockPrisma.assistanceRequest.count.mockResolvedValue(1);
      mockPrisma.notification.count.mockResolvedValue(2);
      mockPrisma.userSession.count.mockResolvedValue(1);
      mockPrisma.evidence.findMany.mockResolvedValue([
        {
          id: 'ev-1',
          userId: 'user-123',
          fileName: 'certificat_medical.pdf',
          size: BigInt(102400),
          sha256: 'a'.repeat(64),
          status: EvidenceStatus.STORED,
          folder: null,
          _count: { accessLogs: 1, sharePermissions: 0 },
        },
      ]);
      mockPrisma.assistanceRequest.findMany.mockResolvedValue([]);
      mockPrisma.notification.findMany.mockResolvedValue([]);
      mockPrisma.emergencyResource.findMany.mockResolvedValue([
        { id: 'em-1', name: 'Ligne 1919', phone: '1919' },
      ]);

      const result = await service.getDashboard('user-123');

      expect(result.user.email).toBe('citoyenne@example.com');
      expect(result.metrics.evidenceCount).toBe(3);
      expect(result.metrics.activeRequestsCount).toBe(1);
      expect(result.metrics.unreadNotificationsCount).toBe(2);
      expect(result.recentEvidences[0].size).toBe(102400); // serialized BigInt
      expect(typeof result.recentEvidences[0].size).toBe('number');
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getDashboard('unknown-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createEvidence', () => {
    it('should create evidence and log access entry', async () => {
      const dto = {
        fileName: 'screenshot.png',
        fileUrl: 'https://vault.sanad.ma/files/screenshot.png',
        mimeType: 'image/png',
        size: 204800,
        sha256: 'e'.repeat(64),
        description: 'Preuve de menaces WhatsApp',
      };

      const createdEvidence = {
        id: 'ev-created-1',
        userId: 'user-123',
        ...dto,
        size: BigInt(dto.size),
        status: EvidenceStatus.STORED,
        folder: null,
      };

      mockPrisma.evidence.create.mockResolvedValue(createdEvidence);
      mockPrisma.evidenceAccessLog.create.mockResolvedValue({ id: 'log-1' });

      const result = await service.createEvidence('user-123', dto, '192.168.1.1');

      expect(mockPrisma.evidence.create).toHaveBeenCalled();
      expect(mockPrisma.evidenceAccessLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            evidenceId: 'ev-created-1',
            userId: 'user-123',
            action: 'VERIFY_HASH',
          }),
        }),
      );
      expect(result.size).toBe(204800);
      expect(result.sha256).toBe('e'.repeat(64));
    });
  });

  describe('deleteEvidence', () => {
    it('should delete evidence if owned by user', async () => {
      mockPrisma.evidence.findUnique.mockResolvedValue({
        id: 'ev-1',
        userId: 'user-123',
      });
      mockPrisma.evidence.delete.mockResolvedValue({ id: 'ev-1' });

      const result = await service.deleteEvidence('user-123', 'ev-1');

      expect(mockPrisma.evidence.delete).toHaveBeenCalledWith({ where: { id: 'ev-1' } });
      expect(result.success).toBe(true);
    });

    it('should throw ForbiddenException if evidence belongs to another user', async () => {
      mockPrisma.evidence.findUnique.mockResolvedValue({
        id: 'ev-1',
        userId: 'different-user',
      });

      await expect(service.deleteEvidence('user-123', 'ev-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('uploadEvidence', () => {
    it('should validate file, calculate SHA-256, store private record and log access', async () => {
      const mockFile = {
        originalname: 'medical_report.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('PDF_CONTENT_AUTHENTIQUE_SANAD'),
      };

      const mockCreated = {
        id: 'ev-upload-1',
        userId: 'user-123',
        folderId: null,
        fileName: 'medical_report.pdf',
        fileUrl: 'private://user-123/temp',
        mimeType: 'application/pdf',
        size: BigInt(1024),
        sha256: 'computed-sha',
        description: 'Certificat médical coups et blessures',
        status: EvidenceStatus.STORED,
        folder: null,
      };

      mockPrisma.evidence.create.mockResolvedValue(mockCreated);
      mockPrisma.evidence.update.mockResolvedValue({
        ...mockCreated,
        fileUrl: 'private://user-123/ev-upload-1_medical_report.pdf',
      });
      mockPrisma.evidenceAccessLog.create.mockResolvedValue({ id: 'log-upload' });

      const result = await service.uploadEvidence(
        'user-123',
        mockFile,
        { description: 'Certificat médical coups et blessures' },
        '10.0.0.1',
      );

      expect(result.fileName).toBe('medical_report.pdf');
      expect(result.size).toBe(1024);
      expect(mockPrisma.evidence.create).toHaveBeenCalled();
      expect(mockPrisma.evidenceAccessLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            evidenceId: 'ev-upload-1',
            action: EvidenceAction.VERIFY_HASH,
          }),
        }),
      );
    });

    it('should throw BadRequestException if file has banned executable extension', async () => {
      const mockFile = {
        originalname: 'malware.exe',
        mimetype: 'application/octet-stream',
        size: 1000,
        buffer: Buffer.from('malicious'),
      };

      await expect(
        service.uploadEvidence('user-123', mockFile, {}),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('downloadOrStreamEvidence', () => {
    const mockEvidence = {
      id: 'ev-stream-1',
      userId: 'user-123',
      fileName: 'constat.pdf',
      fileUrl: 'private://user-123/ev-stream-1_constat.pdf',
      mimeType: 'application/pdf',
      size: BigInt(2048),
      sha256: 'a'.repeat(64),
      sharePermissions: [],
    };

    it('should allow owner to download evidence and record access log', async () => {
      mockPrisma.evidence.findUnique.mockResolvedValue(mockEvidence);
      mockPrisma.evidenceAccessLog.create.mockResolvedValue({ id: 'log-dl' });

      const result = await service.downloadOrStreamEvidence('user-123', 'USER', 'ev-stream-1', true);
      expect(result.fileName).toBe('constat.pdf');
      expect(result.size).toBe(2048);
      expect(mockPrisma.evidenceAccessLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: EvidenceAction.DOWNLOAD,
            result: 'SUCCESS',
          }),
        }),
      );
    });

    it('should allow shared recipient with DOWNLOAD permission', async () => {
      const sharedEvidence = {
        ...mockEvidence,
        sharePermissions: [
          {
            recipientId: 'lawyer-456',
            permission: SharePermissionType.DOWNLOAD,
            status: ShareStatus.ACTIVE,
            validUntil: new Date(Date.now() + 86400000),
          },
        ],
      };
      mockPrisma.evidence.findUnique.mockResolvedValue(sharedEvidence);
      mockPrisma.evidenceAccessLog.create.mockResolvedValue({ id: 'log-dl-pro' });

      const result = await service.downloadOrStreamEvidence('lawyer-456', 'LAWYER', 'ev-stream-1', true);
      expect(result.fileName).toBe('constat.pdf');
    });

    it('should throw ForbiddenException if recipient has READ_ONLY permission and attempts download', async () => {
      const readOnlyEvidence = {
        ...mockEvidence,
        sharePermissions: [
          {
            recipientId: 'lawyer-456',
            permission: SharePermissionType.READ_ONLY,
            status: ShareStatus.ACTIVE,
            validUntil: new Date(Date.now() + 86400000),
          },
        ],
      };
      mockPrisma.evidence.findUnique.mockResolvedValue(readOnlyEvidence);
      mockPrisma.evidenceAccessLog.create.mockResolvedValue({ id: 'log-denied' });

      await expect(
        service.downloadOrStreamEvidence('lawyer-456', 'LAWYER', 'ev-stream-1', true),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrisma.evidenceAccessLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: EvidenceAction.DOWNLOAD,
            result: 'DENIED',
          }),
        }),
      );
    });

    it('should throw ForbiddenException if user has no permission', async () => {
      mockPrisma.evidence.findUnique.mockResolvedValue(mockEvidence);
      mockPrisma.evidenceAccessLog.create.mockResolvedValue({ id: 'log-denied' });

      await expect(
        service.downloadOrStreamEvidence('stranger-999', 'USER', 'ev-stream-1', true),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createEvidenceShare', () => {
    it('should create authorized share permission and log action', async () => {
      mockPrisma.evidence.findUnique.mockResolvedValue({
        id: 'ev-1',
        userId: 'user-123',
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'lawyer-1',
        email: 'avocate@sanad.ma',
        role: 'LAWYER',
      });
      mockPrisma.evidenceSharePermission.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.evidenceSharePermission.create.mockResolvedValue({
        id: 'share-1',
        evidenceId: 'ev-1',
        recipientId: 'lawyer-1',
        permission: SharePermissionType.READ_ONLY,
        status: ShareStatus.ACTIVE,
        validUntil: new Date(),
        recipient: { id: 'lawyer-1', email: 'avocate@sanad.ma' },
      });
      mockPrisma.evidenceAccessLog.create.mockResolvedValue({ id: 'log-share' });
      mockPrisma.notification.create.mockResolvedValue({ id: 'notif-1' });

      const result = await service.createEvidenceShare('user-123', 'ev-1', {
        recipientEmail: 'avocate@sanad.ma',
        permission: SharePermissionType.READ_ONLY,
        validDays: 14,
      });

      expect(result.id).toBe('share-1');
      expect(mockPrisma.evidenceSharePermission.create).toHaveBeenCalled();
      expect(mockPrisma.evidenceAccessLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: EvidenceAction.SHARE,
          }),
        }),
      );
    });

    it('should prevent user from sharing evidence with self', async () => {
      mockPrisma.evidence.findUnique.mockResolvedValue({
        id: 'ev-1',
        userId: 'user-123',
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'citoyenne@example.com',
      });

      await expect(
        service.createEvidenceShare('user-123', 'ev-1', {
          recipientEmail: 'citoyenne@example.com',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('revokeEvidenceShare', () => {
    it('should revoke share permission and log event', async () => {
      mockPrisma.evidenceSharePermission.findUnique.mockResolvedValue({
        id: 'share-1',
        evidenceId: 'ev-1',
        recipientId: 'lawyer-1',
        evidence: { userId: 'user-123' },
      });
      mockPrisma.evidenceSharePermission.update.mockResolvedValue({
        id: 'share-1',
        status: ShareStatus.REVOKED,
        revokedAt: new Date(),
      });
      mockPrisma.evidenceAccessLog.create.mockResolvedValue({ id: 'log-revoke' });

      const result = await service.revokeEvidenceShare('user-123', 'share-1');
      expect(result.status).toBe(ShareStatus.REVOKED);
      expect(mockPrisma.evidenceSharePermission.update).toHaveBeenCalled();
    });
  });

  describe('createAssistanceRequest', () => {
    it('should create assistance request, initial history, and discreet notification', async () => {
      const dto = {
        typeAssistance: AssistanceType.LEGAL,
        description: 'Besoin d’aide urgente pour ordonnance de protection',
      };

      mockPrisma.assistanceRequest.create.mockResolvedValue({
        id: 'req-1',
        userId: 'user-123',
        typeAssistance: dto.typeAssistance,
        description: dto.description,
        status: AssistanceStatus.EN_ATTENTE,
      });

      const result = await service.createAssistanceRequest('user-123', dto);

      expect(mockPrisma.assistanceRequest.create).toHaveBeenCalled();
      expect(mockPrisma.assistanceStatusHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          assistanceRequestId: 'req-1',
          newStatus: AssistanceStatus.EN_ATTENTE,
          changedById: 'user-123',
        }),
      });
      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-123',
          type: 'ASSISTANCE_REQUEST',
        }),
      });
      expect(result.id).toBe('req-1');
    });
  });

  describe('notifications', () => {
    it('should mark notification as read', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue({
        id: 'notif-1',
        userId: 'user-123',
      });
      mockPrisma.notification.update.mockResolvedValue({
        id: 'notif-1',
        isRead: true,
      });

      const res = await service.markNotificationRead('user-123', 'notif-1');
      expect(res.isRead).toBe(true);
    });
  });

  describe('getResources', () => {
    it('should return verified directory resources', async () => {
      mockPrisma.professional.findMany.mockResolvedValue([]);
      mockPrisma.helpCenter.findMany.mockResolvedValue([]);
      mockPrisma.emergencyResource.findMany.mockResolvedValue([]);
      mockPrisma.legalResource.findMany.mockResolvedValue([]);

      const res = await service.getResources();
      expect(res).toHaveProperty('professionals');
      expect(res).toHaveProperty('helpCenters');
      expect(res).toHaveProperty('emergencyResources');
      expect(res).toHaveProperty('legalResources');
    });
  });

  describe('situationAnalysis', () => {
    it('evaluateSituation evaluates situation in-memory without persisting to database', async () => {
      const evaluation = await service.evaluateSituation({
        description: 'Mon conjoint me menace de mort avec une arme à Casablanca CIN AB123456 tel 0612345678',
        violenceTypes: ['PHYSICAL', 'PSYCHOLOGICAL'],
        dangerUrgency: 'IMMEDIATE',
        hasChildren: true,
      });

      expect(evaluation.isSaved).toBe(false);
      expect(evaluation.dangerAssessment.isDangerAlert).toBe(true);
      expect(evaluation.situationSummary.hasRedactions).toBe(true);
      expect(evaluation.legalRights.length).toBeGreaterThan(0);
      expect(evaluation.ethicalDisclaimer).toHaveProperty('fr');
      expect(evaluation.ethicalDisclaimer).toHaveProperty('ar');
      // Verify database was NOT called for persistence
      expect(mockPrisma.analysisResult.create).not.toHaveBeenCalled();
    });

    it('createAnalysis saves analysis and creates ConsentHistory audit trail under Loi 09-08', async () => {
      mockPrisma.consent.findFirst.mockResolvedValue(null);
      mockPrisma.consent.create.mockResolvedValue({
        id: 'consent-1',
        userId: 'user-123',
        consentType: ConsentType.AI_SITUATION_ANALYSIS,
        isGranted: true,
        policyVersion: 'v2.0',
      });
      mockPrisma.consentHistory.create.mockResolvedValue({ id: 'ch-1' });
      mockPrisma.analysisResult.create.mockResolvedValue({
        id: 'analysis-1',
        userId: 'user-123',
        consentId: 'consent-1',
        analysisContent: { situation: 'test' },
      });

      const res = await service.createAnalysis(
        'user-123',
        {
          analysisContent: { situation: 'test' },
          consentGranted: true,
          policyVersion: 'v2.0',
        },
        '196.12.34.56',
      );

      expect(res.id).toBe('analysis-1');
      expect(mockPrisma.consentHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            consentId: 'consent-1',
            newStatus: true,
            policyVersion: 'v2.0',
          }),
        }),
      );
      expect(mockPrisma.analysisResult.create).toHaveBeenCalled();
    });

    it('deleteAnalysis deletes analysis result for authenticated user', async () => {
      mockPrisma.analysisResult.findFirst.mockResolvedValue({
        id: 'analysis-1',
        userId: 'user-123',
      });
      mockPrisma.analysisResult.delete.mockResolvedValue({ id: 'analysis-1' });

      const res = await service.deleteAnalysis('user-123', 'analysis-1');
      expect(res.success).toBe(true);
      expect(mockPrisma.analysisResult.delete).toHaveBeenCalledWith({
        where: { id: 'analysis-1' },
      });
    });
  });
});
