import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Permission } from '../permissions/permissions.enum';
import { hasAllPermissions } from '../permissions/role-permissions.map';
import { AuthenticatedUser } from '../interfaces/jwt-payload.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user: AuthenticatedUser }>();

    if (!user || !user.role) {
      throw new ForbiddenException(
        'Accès refusé : utilisateur ou rôle non identifié',
      );
    }

    const allowed = hasAllPermissions(user.role, requiredPermissions);

    if (!allowed) {
      throw new ForbiddenException(
        `Accès refusé : votre rôle (${user.role}) ne dispose pas des permissions requises [${requiredPermissions.join(', ')}]`,
      );
    }

    return true;
  }
}
