import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LegalCategory, LegalResource } from '@prisma/client';
import { QueryLegalResourceDto } from './dto/query-legal-resource.dto';
import { CreateLegalResourceDto } from './dto/create-legal-resource.dto';
import { UpdateLegalResourceDto } from './dto/update-legal-resource.dto';
import { VERIFIED_MOROCCAN_LEGAL_SEEDS } from './legal-seed-data';

export interface PaginatedLegalResources {
  items: LegalResource[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: {
    totalVerified: number;
    totalUnverified: number;
    totalActive: number;
  };
}

@Injectable()
export class LegalService implements OnModuleInit {
  private readonly logger = new Logger(LegalService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      const count = await this.prisma.legalResource.count();
      if (count === 0) {
        this.logger.log(
          'Seeding initial verified Moroccan legal corpus into database...',
        );
        for (const seed of VERIFIED_MOROCCAN_LEGAL_SEEDS) {
          await this.prisma.legalResource.create({
            data: seed,
          });
        }
        this.logger.log(
          `Successfully seeded ${VERIFIED_MOROCCAN_LEGAL_SEEDS.length} official Moroccan legal resources.`,
        );
      }
    } catch (err: any) {
      this.logger.warn(
        `Unable to initialize legal resources seed: ${err?.message || err}`,
      );
    }
  }

  async findAll(
    query: QueryLegalResourceDto,
    includeInactive = false,
  ): Promise<PaginatedLegalResources> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.language) {
      where.language = query.language;
    }

    if (query.verificationStatus === 'verified') {
      where.lastVerifiedAt = { not: null };
    } else if (query.verificationStatus === 'unverified') {
      where.lastVerifiedAt = null;
    }

    if (query.search && query.search.trim().length > 0) {
      const term = query.search.trim();
      where.OR = [
        { title: { contains: term } },
        { description: { contains: term } },
        { legalReference: { contains: term } },
        { officialSource: { contains: term } },
      ];
    }

    const [items, total, totalVerified, totalUnverified, totalActive] =
      await Promise.all([
        this.prisma.legalResource.findMany({
          where,
          orderBy: [
            { lastVerifiedAt: 'desc' },
            { createdAt: 'desc' },
          ],
          skip,
          take: limit,
        }),
        this.prisma.legalResource.count({ where }),
        this.prisma.legalResource.count({
          where: { lastVerifiedAt: { not: null } },
        }),
        this.prisma.legalResource.count({
          where: { lastVerifiedAt: null },
        }),
        this.prisma.legalResource.count({
          where: { isActive: true },
        }),
      ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      stats: {
        totalVerified,
        totalUnverified,
        totalActive,
      },
    };
  }

  async findOne(id: string): Promise<LegalResource> {
    const resource = await this.prisma.legalResource.findUnique({
      where: { id },
    });
    if (!resource) {
      throw new NotFoundException(`Ressource légale introuvable avec l'ID ${id}`);
    }
    return resource;
  }

  async getCategories() {
    const allCategories = Object.values(LegalCategory);
    const resources = await this.prisma.legalResource.findMany({
      where: { isActive: true },
      select: {
        category: true,
        lastVerifiedAt: true,
      },
    });

    const categoryStats = allCategories.map((category) => {
      const matching = resources.filter((r) => r.category === category);
      const verified = matching.filter((r) => r.lastVerifiedAt !== null).length;
      return {
        category,
        total: matching.length,
        verified,
        unverified: matching.length - verified,
      };
    });

    return categoryStats;
  }

  async create(dto: CreateLegalResourceDto, adminId?: string): Promise<LegalResource> {
    const resource = await this.prisma.legalResource.create({
      data: {
        title: dto.title.trim(),
        description: dto.description.trim(),
        legalReference: dto.legalReference.trim(),
        officialSource: dto.officialSource.trim(),
        category: dto.category,
        language: dto.language || 'ar',
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : new Date(),
        lastVerifiedAt: dto.isVerified ? new Date() : null,
        isActive: true,
      },
    });

    if (adminId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            actorId: adminId,
            action: 'CREATE_LEGAL_RESOURCE',
            entityType: 'LegalResource',
            entityId: resource.id,
            metadata: {
              title: resource.title,
              category: resource.category,
              legalReference: resource.legalReference,
              isVerified: dto.isVerified,
            },
          },
        });
      } catch (err: any) {
        this.logger.warn(`Failed to log audit for resource creation: ${err?.message}`);
      }
    }

    return resource;
  }

  async update(
    id: string,
    dto: UpdateLegalResourceDto,
    adminId?: string,
  ): Promise<LegalResource> {
    await this.findOne(id);

    const updateData: any = {};
    if (dto.title !== undefined) updateData.title = dto.title.trim();
    if (dto.description !== undefined) updateData.description = dto.description.trim();
    if (dto.legalReference !== undefined) updateData.legalReference = dto.legalReference.trim();
    if (dto.officialSource !== undefined) updateData.officialSource = dto.officialSource.trim();
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.language !== undefined) updateData.language = dto.language;
    if (dto.publishedAt !== undefined) {
      updateData.publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : null;
    }
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.isVerified !== undefined) {
      updateData.lastVerifiedAt = dto.isVerified ? new Date() : null;
    }

    const updated = await this.prisma.legalResource.update({
      where: { id },
      data: updateData,
    });

    if (adminId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            actorId: adminId,
            action: 'UPDATE_LEGAL_RESOURCE',
            entityType: 'LegalResource',
            entityId: id,
            metadata: updateData,
          },
        });
      } catch (err: any) {
        this.logger.warn(`Failed to log audit for resource update: ${err?.message}`);
      }
    }

    return updated;
  }

  async verify(id: string, adminId?: string): Promise<LegalResource> {
    await this.findOne(id);

    const updated = await this.prisma.legalResource.update({
      where: { id },
      data: {
        lastVerifiedAt: new Date(),
        isActive: true,
      },
    });

    if (adminId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            actorId: adminId,
            action: 'VERIFY_LEGAL_RESOURCE',
            entityType: 'LegalResource',
            entityId: id,
            metadata: {
              verifiedAt: updated.lastVerifiedAt,
            },
          },
        });
      } catch (err: any) {
        this.logger.warn(`Failed to log audit for resource verification: ${err?.message}`);
      }
    }

    return updated;
  }

  async toggleStatus(id: string, adminId?: string): Promise<LegalResource> {
    const existing = await this.findOne(id);
    const newStatus = !existing.isActive;

    const updated = await this.prisma.legalResource.update({
      where: { id },
      data: { isActive: newStatus },
    });

    if (adminId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            actorId: adminId,
            action: 'TOGGLE_LEGAL_RESOURCE_STATUS',
            entityType: 'LegalResource',
            entityId: id,
            metadata: { newStatus },
          },
        });
      } catch (err: any) {
        this.logger.warn(`Failed to log audit for resource status toggle: ${err?.message}`);
      }
    }

    return updated;
  }

  async delete(id: string, adminId?: string): Promise<{ success: boolean; id: string }> {
    await this.findOne(id);

    await this.prisma.legalResource.delete({
      where: { id },
    });

    if (adminId) {
      try {
        await this.prisma.auditLog.create({
          data: {
            actorId: adminId,
            action: 'DELETE_LEGAL_RESOURCE',
            entityType: 'LegalResource',
            entityId: id,
          },
        });
      } catch (err: any) {
        this.logger.warn(`Failed to log audit for resource deletion: ${err?.message}`);
      }
    }

    return { success: true, id };
  }
}
