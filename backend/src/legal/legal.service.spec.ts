import { Test, TestingModule } from '@nestjs/testing';
import { LegalService } from './legal.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { LegalCategory } from '@prisma/client';

describe('LegalService', () => {
  let service: LegalService;
  let prisma: any;

  const mockLegalResource = {
    id: 'res-123',
    title: 'Loi n° 103-13',
    description: 'Lutte contre les violences faites aux femmes',
    legalReference: 'Loi n° 103-13, Articles 1 à 5',
    officialSource: 'Bulletin Officiel n° 6655',
    category: LegalCategory.CRIMINAL_LAW_VIOLENCE,
    language: 'fr',
    publishedAt: new Date('2018-03-12'),
    lastVerifiedAt: new Date('2026-01-15'),
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-15'),
  };

  const mockPrismaService = {
    legalResource: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegalService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<LegalService>(LegalService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated legal resources and stats', async () => {
      prisma.legalResource.findMany.mockResolvedValue([mockLegalResource]);
      prisma.legalResource.count
        .mockResolvedValueOnce(1) // total matching
        .mockResolvedValueOnce(1) // totalVerified
        .mockResolvedValueOnce(0) // totalUnverified
        .mockResolvedValueOnce(1); // totalActive

      const result = await service.findAll({
        category: LegalCategory.CRIMINAL_LAW_VIOLENCE,
        language: 'fr',
        search: 'violences',
        verificationStatus: 'verified',
        page: 1,
        limit: 10,
      });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.stats.totalVerified).toBe(1);
      expect(prisma.legalResource.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return resource if found', async () => {
      prisma.legalResource.findUnique.mockResolvedValue(mockLegalResource);

      const result = await service.findOne('res-123');
      expect(result).toEqual(mockLegalResource);
      expect(prisma.legalResource.findUnique).toHaveBeenCalledWith({
        where: { id: 'res-123' },
      });
    });

    it('should throw NotFoundException if resource not found', async () => {
      prisma.legalResource.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getCategories', () => {
    it('should group resources by category and count verified status', async () => {
      prisma.legalResource.findMany.mockResolvedValue([
        {
          category: LegalCategory.CRIMINAL_LAW_VIOLENCE,
          lastVerifiedAt: new Date(),
        },
        {
          category: LegalCategory.CRIMINAL_LAW_VIOLENCE,
          lastVerifiedAt: null,
        },
      ]);

      const stats = await service.getCategories();
      expect(stats.length).toBeGreaterThan(0);
      const criminalCategory = stats.find(
        (c) => c.category === LegalCategory.CRIMINAL_LAW_VIOLENCE,
      );
      expect(criminalCategory).toBeDefined();
      expect(criminalCategory?.total).toBe(2);
      expect(criminalCategory?.verified).toBe(1);
      expect(criminalCategory?.unverified).toBe(1);
    });
  });

  describe('create', () => {
    it('should create legal resource and write audit log', async () => {
      prisma.legalResource.create.mockResolvedValue(mockLegalResource);
      prisma.auditLog.create.mockResolvedValue({ id: 'log-1' });

      const dto = {
        title: 'Loi n° 103-13',
        description: 'Lutte contre les violences faites aux femmes',
        legalReference: 'Loi n° 103-13, Articles 1 à 5',
        officialSource: 'Bulletin Officiel n° 6655',
        category: LegalCategory.CRIMINAL_LAW_VIOLENCE,
        language: 'fr',
        isVerified: true,
      };

      const result = await service.create(dto, 'admin-123');
      expect(result).toEqual(mockLegalResource);
      expect(prisma.legalResource.create).toHaveBeenCalled();
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            actorId: 'admin-123',
            action: 'CREATE_LEGAL_RESOURCE',
          }),
        }),
      );
    });
  });

  describe('verify', () => {
    it('should update lastVerifiedAt and create audit log', async () => {
      prisma.legalResource.findUnique.mockResolvedValue(mockLegalResource);
      const verifiedResource = {
        ...mockLegalResource,
        lastVerifiedAt: new Date(),
      };
      prisma.legalResource.update.mockResolvedValue(verifiedResource);
      prisma.auditLog.create.mockResolvedValue({ id: 'log-2' });

      const result = await service.verify('res-123', 'admin-123');
      expect(result.lastVerifiedAt).toBeDefined();
      expect(prisma.legalResource.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'res-123' },
          data: expect.objectContaining({
            isActive: true,
          }),
        }),
      );
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });

  describe('toggleStatus', () => {
    it('should invert isActive flag', async () => {
      prisma.legalResource.findUnique.mockResolvedValue({
        ...mockLegalResource,
        isActive: true,
      });
      prisma.legalResource.update.mockResolvedValue({
        ...mockLegalResource,
        isActive: false,
      });

      const result = await service.toggleStatus('res-123', 'admin-123');
      expect(result.isActive).toBe(false);
      expect(prisma.legalResource.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'res-123' },
          data: { isActive: false },
        }),
      );
    });
  });

  describe('delete', () => {
    it('should remove resource from database and log audit', async () => {
      prisma.legalResource.findUnique.mockResolvedValue(mockLegalResource);
      prisma.legalResource.delete.mockResolvedValue(mockLegalResource);

      const result = await service.delete('res-123', 'admin-123');
      expect(result).toEqual({ success: true, id: 'res-123' });
      expect(prisma.legalResource.delete).toHaveBeenCalledWith({
        where: { id: 'res-123' },
      });
    });
  });
});
