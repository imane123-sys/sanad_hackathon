import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import { Permission } from '../permissions/permissions.enum';
import { Role } from '@prisma/client';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionsGuard(reflector);
  });

  const createMockContext = (user?: any): ExecutionContext => {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  };

  it('allows access when no permissions are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

    const context = createMockContext({ role: Role.USER });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows ADMIN to access ADMIN_DASHBOARD_ACCESS', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([Permission.ADMIN_DASHBOARD_ACCESS]);

    const context = createMockContext({ role: Role.ADMIN });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows LAWYER to access PROFESSIONAL_REQUESTS_VIEW', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([Permission.PROFESSIONAL_REQUESTS_VIEW]);

    const context = createMockContext({ role: Role.LAWYER });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows ASSOCIATION to access ORGANIZATION_PROFILE_MANAGE', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([Permission.ORGANIZATION_PROFILE_MANAGE]);

    const context = createMockContext({ role: Role.ASSOCIATION });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows HELP_CENTER to access ORGANIZATION_PROFILE_MANAGE', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([Permission.ORGANIZATION_PROFILE_MANAGE]);

    const context = createMockContext({ role: Role.HELP_CENTER });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('throws ForbiddenException when USER attempts to access ADMIN_DASHBOARD_ACCESS', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([Permission.ADMIN_DASHBOARD_ACCESS]);

    const context = createMockContext({ role: Role.USER });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when LAWYER attempts to access ADMIN_USERS_MANAGE', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([Permission.ADMIN_USERS_MANAGE]);

    const context = createMockContext({ role: Role.LAWYER });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
