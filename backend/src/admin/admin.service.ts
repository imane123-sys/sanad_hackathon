import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, UserStatus, VerificationStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const [
      totalUsers,
      usersByRole,
      activeSessions,
      pendingVerifications,
      assistanceRequestsCount,
      auditLogsCount,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: { id: true },
      }),
      this.prisma.userSession.count({
        where: { status: 'ACTIVE' },
      }),
      this.prisma.professionalVerification.count({
        where: { status: VerificationStatus.PENDING },
      }),
      this.prisma.assistanceRequest.count(),
      this.prisma.auditLog.count(),
    ]);

    const roleCounts: Record<string, number> = {
      USER: 0,
      ADMIN: 0,
      LAWYER: 0,
      PSYCHOLOGIST: 0,
      ASSOCIATION: 0,
      HELP_CENTER: 0,
    };

    usersByRole.forEach((group) => {
      roleCounts[group.role] = group._count.id;
    });

    return {
      totalUsers,
      roleCounts,
      activeSessions,
      pendingVerifications,
      assistanceRequestsCount,
      auditLogsCount,
      timestamp: new Date().toISOString(),
    };
  }

  async getUsers() {
    return this.prisma.user.findMany({
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
        updatedAt: true,
        _count: {
          select: {
            sessions: true,
            assistanceRequests: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async updateUserStatus(userId: string, status: UserStatus, adminId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    // If suspended, revoke all active sessions
    if (status === UserStatus.SUSPENDED) {
      await this.prisma.userSession.updateMany({
        where: { userId, status: 'ACTIVE' },
        data: { status: 'REVOKED', revokedAt: new Date() },
      });
    }

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'UPDATE_USER_STATUS',
        entityType: 'User',
        entityId: userId,
        metadata: { status, userEmail: user.email },
      },
    });

    return updatedUser;
  }

  async getVerifications() {
    return this.prisma.professionalVerification.findMany({
      include: {
        professional: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
        verifiedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async reviewVerification(
    verificationId: string,
    adminId: string,
    status: VerificationStatus,
    comment?: string,
  ) {
    const verification = await this.prisma.professionalVerification.findUnique({
      where: { id: verificationId },
      include: { professional: true },
    });

    if (!verification) {
      throw new NotFoundException('Dossier de vérification introuvable');
    }

    const now = new Date();

    const [updatedVerification] = await this.prisma.$transaction([
      this.prisma.professionalVerification.update({
        where: { id: verificationId },
        data: {
          status,
          verifiedById: adminId,
          verifiedAt: now,
          comment,
        },
      }),
      this.prisma.professional.update({
        where: { id: verification.professionalId },
        data: { verificationStatus: status },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId: adminId,
          action: 'REVIEW_PROFESSIONAL_VERIFICATION',
          entityType: 'ProfessionalVerification',
          entityId: verificationId,
          metadata: { status, comment, professionalId: verification.professionalId },
        },
      }),
    ]);

    return updatedVerification;
  }

  async getAuditLogs() {
    return this.prisma.auditLog.findMany({
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            role: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
