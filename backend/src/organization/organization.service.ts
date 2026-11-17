import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UpdateOrganizationProfileDto {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  openingHours?: string;
  receptionConditions?: string;
  isFree?: boolean;
}

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(userId: string, role: string) {
    const isHelpCenter = role === 'HELP_CENTER';

    const [totalAssociations, totalHelpCenters, activeRequests] = await Promise.all([
      this.prisma.association.count({ where: { isActive: true } }),
      this.prisma.helpCenter.count({ where: { isVerified: true } }),
      this.prisma.assistanceRequest.count({
        where: {
          typeAssistance: isHelpCenter ? 'SHELTER' : 'SOCIAL',
          status: { in: ['EN_ATTENTE', 'EN_COURS'] },
        },
      }),
    ]);

    return {
      organizationType: isHelpCenter ? 'HELP_CENTER' : 'ASSOCIATION',
      role,
      activeRequests,
      networkStats: {
        totalAssociations,
        totalHelpCenters,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getProfile(userId: string, role: string) {
    const isHelpCenter = role === 'HELP_CENTER';

    if (isHelpCenter) {
      const center = await this.prisma.helpCenter.findFirst({
        orderBy: { createdAt: 'desc' },
      });
      return {
        type: 'HELP_CENTER',
        data: center || {
          name: 'Centre d’Accueil et d’Hébergement d’Urgence',
          address: 'Boulevard Mohammed V, Casablanca',
          city: 'Casablanca',
          phone: '+212 522 000 111',
          openingHours: '24h/24, 7j/7',
          receptionConditions: 'Accueil inconditionnel et anonyme des femmes en situation de vulnérabilité',
          isFree: true,
          isVerified: true,
        },
      };
    }

    const association = await this.prisma.association.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    return {
      type: 'ASSOCIATION',
      data: association || {
        name: 'Association Solidarité Féminine SANAD',
        description: 'Accompagnement médico-social, écoute et orientation pour femmes et enfants',
        city: 'Rabat',
        phone: '+212 537 000 222',
        email: 'contact@association-sanad.ma',
        isFree: true,
        isActive: true,
      },
    };
  }

  async updateProfile(userId: string, role: string, dto: UpdateOrganizationProfileDto) {
    const isHelpCenter = role === 'HELP_CENTER';

    if (isHelpCenter) {
      let center = await this.prisma.helpCenter.findFirst();
      if (!center) {
        center = await this.prisma.helpCenter.create({
          data: {
            name: dto.name || 'Centre d’Accueil SANAD',
            address: dto.address || 'Casablanca',
            city: dto.city || 'Casablanca',
            phone: dto.phone || '+212522000111',
            openingHours: dto.openingHours || '24/7',
            receptionConditions: dto.receptionConditions || 'Accueil inconditionnel',
            isFree: dto.isFree !== undefined ? dto.isFree : true,
          },
        });
      } else {
        center = await this.prisma.helpCenter.update({
          where: { id: center.id },
          data: {
            ...(dto.name ? { name: dto.name } : {}),
            ...(dto.address ? { address: dto.address } : {}),
            ...(dto.city ? { city: dto.city } : {}),
            ...(dto.phone ? { phone: dto.phone } : {}),
            ...(dto.openingHours ? { openingHours: dto.openingHours } : {}),
            ...(dto.receptionConditions ? { receptionConditions: dto.receptionConditions } : {}),
          },
        });
      }
      return center;
    }

    let assoc = await this.prisma.association.findFirst();
    if (!assoc) {
      assoc = await this.prisma.association.create({
        data: {
          name: dto.name || 'Association SANAD',
          description: dto.description || 'Association d’assistance',
          city: dto.city || 'Rabat',
          phone: dto.phone || '+212537000222',
          email: dto.email || 'contact@sanad-assoc.ma',
          isFree: dto.isFree !== undefined ? dto.isFree : true,
        },
      });
    } else {
      assoc = await this.prisma.association.update({
        where: { id: assoc.id },
        data: {
          ...(dto.name ? { name: dto.name } : {}),
          ...(dto.description ? { description: dto.description } : {}),
          ...(dto.city ? { city: dto.city } : {}),
          ...(dto.phone ? { phone: dto.phone } : {}),
          ...(dto.email ? { email: dto.email } : {}),
        },
      });
    }
    return assoc;
  }

  async getRequests(userId: string, role: string) {
    const isHelpCenter = role === 'HELP_CENTER';

    return this.prisma.assistanceRequest.findMany({
      where: {
        typeAssistance: isHelpCenter ? 'SHELTER' : { in: ['SOCIAL', 'EMERGENCY', 'OTHER'] },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            preferredLanguage: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
