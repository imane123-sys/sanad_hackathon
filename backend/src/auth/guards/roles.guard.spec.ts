import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Role } from '@prisma/client';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
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

  it('allows access when no roles are specified on route', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

    const context = createMockContext({ role: Role.USER });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows access when user has the required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

    const context = createMockContext({ role: Role.ADMIN });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows access when user matches one of multiple accepted roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.LAWYER, Role.PSYCHOLOGIST]);

    const context = createMockContext({ role: Role.LAWYER });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('throws ForbiddenException when user does not have the required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

    const context = createMockContext({ role: Role.USER });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when user role is undefined', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

    const context = createMockContext({});
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
