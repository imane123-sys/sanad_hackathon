import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { SessionStatus, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly sessionDurationDays = 7;
  private readonly idleTimeoutMs: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const idleHours = this.configService.get<number>('SESSION_IDLE_TIMEOUT_HOURS', 24);
    this.idleTimeoutMs = idleHours * 60 * 60 * 1000;
  }

  // ----------------------------------------------------
  // 1. REGISTRATION
  // ----------------------------------------------------
  async register(dto: RegisterDto, ipAddress?: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existingUser) {
      throw new ConflictException('Un compte existe déjà avec cette adresse e-mail');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(dto.password, salt);
    const emailVerificationToken = crypto.randomUUID();

    const fullName = `${dto.firstName || ''} ${dto.lastName || ''}`.trim() || undefined;

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        firstName: dto.firstName?.trim() || null,
        lastName: dto.lastName?.trim() || null,
        fullName: fullName || null,
        phone: dto.phone?.trim() || null,
        role: dto.role || Role.USER,
        preferredLanguage: dto.preferredLanguage || 'ar',
        emailVerificationToken,
        isEmailVerified: false,
        profile: {
          create: {
            phone: dto.phone?.trim() || null,
            preferredLanguage: dto.preferredLanguage || 'ar',
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        fullName: true,
        role: true,
        preferredLanguage: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    // Audit log
    await this.logAudit(user.id, 'USER_REGISTER', 'User', user.id, 'SUCCESS', ipAddress, {
      role: user.role,
      preferredLanguage: user.preferredLanguage,
    });

    this.logger.log(`New user registered: ${user.email} (ID: ${user.id})`);

    return {
      message: 'Compte créé avec succès. Veuillez vérifier votre adresse e-mail.',
      user,
      verificationToken: emailVerificationToken,
    };
  }

  // ----------------------------------------------------
  // 2. EMAIL VERIFICATION
  // ----------------------------------------------------
  async verifyEmail(token: string, ipAddress?: string) {
    const user = await this.prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Jeton de vérification invalide ou expiré');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
      },
    });

    await this.logAudit(user.id, 'USER_VERIFY_EMAIL', 'User', user.id, 'SUCCESS', ipAddress);

    this.logger.log(`Email verified for user: ${user.email}`);

    return { message: 'Adresse e-mail vérifiée avec succès. Vous pouvez maintenant vous connecter.' };
  }

  // ----------------------------------------------------
  // 3. LOGIN & SESSION CREATION
  // ----------------------------------------------------
  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    if (!user.isActive || user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Ce compte est inactif ou suspendu');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      await this.logAudit(user.id, 'USER_LOGIN_FAILED', 'User', user.id, 'DENIED', ipAddress, {
        reason: 'bad_password',
      });
      throw new UnauthorizedException('Identifiants incorrects');
    }

    // Create session in MySQL
    const sessionId = crypto.randomUUID();
    const tokenHash = crypto
      .createHash('sha256')
      .update(`${sessionId}:${user.id}:${Date.now()}`)
      .digest('hex');

    const expiresAt = new Date(Date.now() + this.sessionDurationDays * 24 * 60 * 60 * 1000);
    const deviceInfo = dto.deviceInfo?.trim() || userAgent || 'Appareil web non identifié';

    const session = await this.prisma.userSession.create({
      data: {
        id: sessionId,
        userId: user.id,
        tokenHash,
        deviceInfo,
        ipAddress: ipAddress || '127.0.0.1',
        status: SessionStatus.ACTIVE,
        expiresAt,
        lastActivityAt: new Date(),
      },
    });

    // Sign JWT
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.id,
    };

    const accessToken = this.jwtService.sign(payload);

    await this.logAudit(user.id, 'USER_LOGIN', 'UserSession', session.id, 'SUCCESS', ipAddress, {
      deviceInfo,
    });

    this.logger.log(`User logged in: ${user.email} on session ${session.id}`);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        role: user.role,
        preferredLanguage: user.preferredLanguage,
        isEmailVerified: user.isEmailVerified,
      },
      session: {
        id: session.id,
        deviceInfo: session.deviceInfo,
        ipAddress: session.ipAddress,
        expiresAt: session.expiresAt,
      },
    };
  }

  // ----------------------------------------------------
  // 4. LOGOUT (CURRENT SESSION)
  // ----------------------------------------------------
  async logout(userId: string, sessionId: string, ipAddress?: string) {
    await this.prisma.userSession.updateMany({
      where: {
        id: sessionId,
        userId,
        status: SessionStatus.ACTIVE,
      },
      data: {
        status: SessionStatus.REVOKED,
        revokedAt: new Date(),
      },
    });

    await this.logAudit(userId, 'USER_LOGOUT', 'UserSession', sessionId, 'SUCCESS', ipAddress);

    return { message: 'Déconnexion effectuée avec succès' };
  }

  // ----------------------------------------------------
  // 5. SESSION MANAGEMENT & ACTIVE DEVICES
  // ----------------------------------------------------
  async getSessions(userId: string, currentSessionId: string) {
    const now = new Date();

    // Mark naturally expired sessions
    await this.prisma.userSession.updateMany({
      where: {
        userId,
        status: SessionStatus.ACTIVE,
        expiresAt: { lte: now },
      },
      data: { status: SessionStatus.EXPIRED },
    });

    const sessions = await this.prisma.userSession.findMany({
      where: { userId },
      orderBy: { lastActivityAt: 'desc' },
      select: {
        id: true,
        deviceInfo: true,
        ipAddress: true,
        status: true,
        createdAt: true,
        lastActivityAt: true,
        expiresAt: true,
        revokedAt: true,
      },
    });

    return sessions.map((s) => ({
      ...s,
      isCurrent: s.id === currentSessionId,
    }));
  }

  // ----------------------------------------------------
  // 6. REVOKE A SPECIFIC SESSION / DEVICE
  // ----------------------------------------------------
  async revokeSession(userId: string, sessionIdToRevoke: string, ipAddress?: string) {
    const session = await this.prisma.userSession.findFirst({
      where: {
        id: sessionIdToRevoke,
        userId,
      },
    });

    if (!session) {
      throw new NotFoundException('Session introuvable');
    }

    if (session.status === SessionStatus.REVOKED) {
      return { message: 'Cette session est déjà révoquée' };
    }

    await this.prisma.userSession.update({
      where: { id: sessionIdToRevoke },
      data: {
        status: SessionStatus.REVOKED,
        revokedAt: new Date(),
      },
    });

    await this.logAudit(
      userId,
      'USER_REVOKE_SESSION',
      'UserSession',
      sessionIdToRevoke,
      'SUCCESS',
      ipAddress,
    );

    return { message: 'L’appareil / session a été déconnecté avec succès' };
  }

  // ----------------------------------------------------
  // 7. LOGOUT FROM ALL DEVICES
  // ----------------------------------------------------
  async logoutAll(userId: string, ipAddress?: string) {
    const result = await this.prisma.userSession.updateMany({
      where: {
        userId,
        status: SessionStatus.ACTIVE,
      },
      data: {
        status: SessionStatus.REVOKED,
        revokedAt: new Date(),
      },
    });

    await this.logAudit(
      userId,
      'USER_LOGOUT_ALL_DEVICES',
      'UserSession',
      undefined,
      'SUCCESS',
      ipAddress,
      { revokedCount: result.count },
    );

    return {
      message: `${result.count} session(s) active(s) révoquée(s). Vous avez été déconnecté de tous vos appareils.`,
      revokedCount: result.count,
    };
  }

  // ----------------------------------------------------
  // 8. FORGOT PASSWORD
  // ----------------------------------------------------
  async forgotPassword(dto: ForgotPasswordDto, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    // To prevent user enumeration, always return positive acknowledgement
    if (!user) {
      return {
        message:
          'Si cette adresse e-mail correspond à un compte actif, un lien de réinitialisation vous a été envoyé.',
      };
    }

    const resetToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: expiresAt,
      },
    });

    await this.logAudit(
      user.id,
      'USER_PASSWORD_RESET_REQUEST',
      'User',
      user.id,
      'SUCCESS',
      ipAddress,
    );

    return {
      message:
        'Si cette adresse e-mail correspond à un compte actif, un lien de réinitialisation vous a été envoyé.',
      resetToken, // Included for development/demo environment
    };
  }

  // ----------------------------------------------------
  // 9. RESET PASSWORD (WITH MANDATORY SESSION REVOCATION)
  // ----------------------------------------------------
  async resetPassword(dto: ResetPasswordDto, ipAddress?: string) {
    const now = new Date();

    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: dto.token,
        passwordResetExpires: { gt: now },
      },
    });

    if (!user) {
      throw new BadRequestException('Le jeton de réinitialisation est invalide ou a expiré');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(dto.newPassword, salt);

    // Update password and clear reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    // CRITICAL SECURITY RULE (§4.1 Cahier des Charges):
    // "Révocation des sessions après un changement de mot de passe"
    const revoked = await this.prisma.userSession.updateMany({
      where: {
        userId: user.id,
        status: SessionStatus.ACTIVE,
      },
      data: {
        status: SessionStatus.REVOKED,
        revokedAt: now,
      },
    });

    await this.logAudit(
      user.id,
      'USER_PASSWORD_RESET_SUCCESS',
      'User',
      user.id,
      'SUCCESS',
      ipAddress,
      { sessionsRevoked: revoked.count },
    );

    this.logger.log(`Password reset successfully for ${user.email}. Revoked ${revoked.count} sessions.`);

    return {
      message:
        'Votre mot de passe a été mis à jour avec succès. Par mesure de sécurité, toutes vos sessions précédentes ont été déconnectées.',
    };
  }

  // ----------------------------------------------------
  // 10. CURRENT PROFILE
  // ----------------------------------------------------
  async getProfile(userId: string) {
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
        preferredLanguage: true,
        status: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        _count: {
          select: {
            sessions: {
              where: { status: SessionStatus.ACTIVE },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return user;
  }

  // ----------------------------------------------------
  // HELPER: AUDIT LOGGING (CNDP & §9.23 Compliance)
  // ----------------------------------------------------
  private async logAudit(
    actorId: string | undefined,
    action: string,
    entityType: string,
    entityId?: string,
    result: 'SUCCESS' | 'DENIED' | 'ERROR' = 'SUCCESS',
    ipAddress?: string,
    metadata?: Record<string, any>,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: actorId || null,
          action,
          entityType,
          entityId: entityId || null,
          result,
          ipAddress: ipAddress || null,
          metadata: metadata || null,
        },
      });
    } catch (e) {
      this.logger.warn(`Could not write audit log: ${(e as Error).message}`);
    }
  }
}
