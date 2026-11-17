import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Role, SessionStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    userSession: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  const mockJwt = {
    sign: jest.fn().mockReturnValue('mock_jwt_token_xyz'),
  };

  const mockConfig = {
    get: jest.fn((key: string, defaultVal: any) => defaultVal),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw ConflictException if email is already taken', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({ id: 'existing-id' });

      await expect(
        service.register({
          email: 'test@example.ma',
          password: 'Password123!',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user with hashed password and verification token', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      mockPrisma.user.create.mockResolvedValueOnce({
        id: 'user-1',
        email: 'test@example.ma',
        role: Role.USER,
        isEmailVerified: false,
      });

      const result = await service.register({
        email: 'test@example.ma',
        password: 'Password123!',
        firstName: 'Fatima',
        lastName: 'Zahra',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('verificationToken');
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.login({
          email: 'notfound@example.ma',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const hash = await bcrypt.hash('CorrectPassword123!', 10);
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        email: 'user@example.ma',
        passwordHash: hash,
        isActive: true,
        status: 'ACTIVE',
      });

      await expect(
        service.login({
          email: 'user@example.ma',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should succeed and return token and session if credentials valid', async () => {
      const password = 'CorrectPassword123!';
      const hash = await bcrypt.hash(password, 10);
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        email: 'user@example.ma',
        passwordHash: hash,
        isActive: true,
        status: 'ACTIVE',
        role: Role.USER,
        preferredLanguage: 'ar',
        isEmailVerified: true,
      });

      mockPrisma.userSession.create.mockResolvedValueOnce({
        id: 'session-1',
        userId: 'user-1',
        deviceInfo: 'Desktop Test',
        ipAddress: '127.0.0.1',
        expiresAt: new Date(Date.now() + 86400000),
      });

      const result = await service.login({
        email: 'user@example.ma',
        password,
      });

      expect(result).toHaveProperty('accessToken', 'mock_jwt_token_xyz');
      expect(result).toHaveProperty('session');
      expect(result.user).toHaveProperty('email', 'user@example.ma');
    });
  });

  describe('logout & session revocation', () => {
    it('should revoke the current session on logout', async () => {
      mockPrisma.userSession.updateMany.mockResolvedValueOnce({ count: 1 });

      const res = await service.logout('user-1', 'session-1');
      expect(res).toHaveProperty('message');
      expect(mockPrisma.userSession.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: 'session-1', userId: 'user-1' }),
        }),
      );
    });

    it('should revoke all sessions on logoutAll', async () => {
      mockPrisma.userSession.updateMany.mockResolvedValueOnce({ count: 3 });

      const res = await service.logoutAll('user-1');
      expect(res.revokedCount).toBe(3);
    });
  });

  describe('resetPassword', () => {
    it('should revoke all existing sessions when password is reset', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce({
        id: 'user-1',
        email: 'user@example.ma',
      });
      mockPrisma.user.update.mockResolvedValueOnce({});
      mockPrisma.userSession.updateMany.mockResolvedValueOnce({ count: 2 });

      const res = await service.resetPassword({
        token: 'valid-reset-token',
        newPassword: 'BrandNewPassword123!',
      });

      expect(res).toHaveProperty('message');
      expect(mockPrisma.userSession.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-1',
            status: SessionStatus.ACTIVE,
          }),
        }),
      );
    });
  });
});
