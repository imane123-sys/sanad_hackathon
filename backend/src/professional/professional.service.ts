import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AssistanceStatus,
  ProfessionalType,
  ServiceType,
  VerificationStatus,
} from '@prisma/client';

export interface UpdateProfessionalProfileDto {
  specialty?: string;
  bio?: string;
  city?: string;
  professionalType?: ProfessionalType;
  isVolunteer?: boolean;
}

export interface CreateServiceDto {
  name: string;
  description?: string;
  serviceType: ServiceType;
  price?: number;
  currency?: string;
}

@Injectable()
export class ProfessionalService {
  constructor(private prisma: PrismaService) {}

  private async getOrCreateProfessional(userId: string, role: string) {
    let professional = await this.prisma.professional.findUnique({
      where: { userId },
    });

    if (!professional) {
      const type = role === 'PSYCHOLOGIST' ? ProfessionalType.PSYCHOLOGIST : ProfessionalType.LAWYER;
      professional = await this.prisma.professional.create({
        data: {
          userId,
          specialty: role === 'PSYCHOLOGIST' ? 'Soutien psychologique & Traumatisme' : 'Droit de la famille & Protection',
          city: 'Casablanca',
          professionalType: type,
          verificationStatus: VerificationStatus.PENDING,
        },
      });
    }

    return professional;
  }

  async getDashboard(userId: string, role: string) {
    const professional = await this.getOrCreateProfessional(userId, role);

    const [assignedRequestsCount, servicesCount, appointmentsCount] = await Promise.all([
      this.prisma.assistanceRequest.count({
        where: { professionalId: professional.id },
      }),
      this.prisma.professionalService.count({
        where: { professionalId: professional.id, isActive: true },
      }),
      this.prisma.appointment.count({
        where: { professionalId: professional.id },
      }),
    ]);

    return {
      professionalId: professional.id,
      professionalType: professional.professionalType,
      specialty: professional.specialty,
      city: professional.city,
      verificationStatus: professional.verificationStatus,
      isVolunteer: professional.isVolunteer,
      assignedRequestsCount,
      servicesCount,
      appointmentsCount,
      timestamp: new Date().toISOString(),
    };
  }

  async getProfile(userId: string, role: string) {
    const professional = await this.getOrCreateProfessional(userId, role);

    return this.prisma.professional.findUnique({
      where: { id: professional.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            isEmailVerified: true,
          },
        },
        services: true,
        verifications: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  }

  async updateProfile(userId: string, role: string, dto: UpdateProfessionalProfileDto) {
    const professional = await this.getOrCreateProfessional(userId, role);

    return this.prisma.professional.update({
      where: { id: professional.id },
      data: {
        ...(dto.specialty ? { specialty: dto.specialty } : {}),
        ...(dto.bio !== undefined ? { bio: dto.bio } : {}),
        ...(dto.city ? { city: dto.city } : {}),
        ...(dto.isVolunteer !== undefined ? { isVolunteer: dto.isVolunteer } : {}),
      },
    });
  }

  async getServices(userId: string, role: string) {
    const professional = await this.getOrCreateProfessional(userId, role);

    return this.prisma.professionalService.findMany({
      where: { professionalId: professional.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createService(userId: string, role: string, dto: CreateServiceDto) {
    const professional = await this.getOrCreateProfessional(userId, role);

    return this.prisma.professionalService.create({
      data: {
        professionalId: professional.id,
        name: dto.name,
        description: dto.description,
        serviceType: dto.serviceType,
        price: dto.price !== undefined ? dto.price : 0,
        currency: dto.currency || 'MAD',
      },
    });
  }

  async getAssignedRequests(userId: string, role: string) {
    const professional = await this.getOrCreateProfessional(userId, role);

    return this.prisma.assistanceRequest.findMany({
      where: { professionalId: professional.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        statusHistory: {
          orderBy: { changedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateRequestStatus(
    userId: string,
    role: string,
    requestId: string,
    newStatus: AssistanceStatus,
    comment?: string,
  ) {
    const professional = await this.getOrCreateProfessional(userId, role);

    const request = await this.prisma.assistanceRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Demande d’assistance introuvable');
    }

    if (request.professionalId && request.professionalId !== professional.id) {
      throw new ForbiddenException('Vous n’êtes pas autorisé à modifier cette demande');
    }

    const oldStatus = request.status;

    const [updatedRequest] = await this.prisma.$transaction([
      this.prisma.assistanceRequest.update({
        where: { id: requestId },
        data: {
          status: newStatus,
          professionalId: professional.id,
        },
      }),
      this.prisma.assistanceStatusHistory.create({
        data: {
          assistanceRequestId: requestId,
          oldStatus,
          newStatus,
          changedById: userId,
          comment,
        },
      }),
    ]);

    return updatedRequest;
  }
}
