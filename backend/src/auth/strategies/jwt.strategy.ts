import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload, AuthenticatedUser } from '../interfaces/jwt-payload.interface';
import { SessionStatus } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly idleTimeoutMs: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'sanad_secure_jwt_secret_key_2026_super_strong_value'),
    });

    const idleHours = this.configService.get<number>('SESSION_IDLE_TIMEOUT_HOURS', 24);
    this.idleTimeoutMs = idleHours * 60 * 60 * 1000;
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const { sub: userId, sessionId } = payload;

    // 1. Fetch user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        fullName: true,
        role: true,
        preferredLanguage: true,
        isActive: true,
        status: true,
        isEmailVerified: true,
      },
    });

    if (!user || !user.isActive || user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Compte utilisateur inactif ou introuvable');
    }

    // 2. Fetch session and verify active status
    const session = await this.prisma.userSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new UnauthorizedException('Session non reconnue ou révoquée');
    }

    if (session.status !== SessionStatus.ACTIVE) {
      throw new UnauthorizedException('Cette session a été révoquée');
    }

    const now = new Date();

    // Check expiration
    if (session.expiresAt <= now) {
      await this.prisma.userSession.update({
        where: { id: sessionId },
        data: { status: SessionStatus.EXPIRED },
      });
      throw new UnauthorizedException('Session expirée');
    }

    // Check automatic idle timeout
    const timeSinceLastActivity = now.getTime() - new Date(session.lastActivityAt).getTime();
    if (timeSinceLastActivity > this.idleTimeoutMs) {
      await this.prisma.userSession.update({
        where: { id: sessionId },
        data: { status: SessionStatus.EXPIRED },
      });
      throw new UnauthorizedException('Session expirée suite à une inactivité prolongée');
    }

    // Update last activity time (throttled to once every 60s)
    if (timeSinceLastActivity > 60000) {
      await this.prisma.userSession.update({
        where: { id: sessionId },
        data: { lastActivityAt: now },
      });
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      isEmailVerified: user.isEmailVerified,
      sessionId: session.id,
    };
  }
}
