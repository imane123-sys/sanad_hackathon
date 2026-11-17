import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  role: Role;
  preferredLanguage: string;
  isEmailVerified: boolean;
  sessionId: string;
}
