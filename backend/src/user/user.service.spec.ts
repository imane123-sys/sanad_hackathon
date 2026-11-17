import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import {
  AssistanceStatus,
  AssistanceType,
  ConsentType,
  EvidenceStatus,
  Role,
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
      delete: jest.fn(),
    },
    evidenceAccessLog: {
      create: jest.fn(),
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
    },
    analysisResult: {
      findMany: jest.fn(),
      create: jest.fn(),
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
});
