import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { Role, UserStatus, VerificationStatus } from '@prisma/client';
import { Permission } from '../auth/permissions/permissions.enum';

class UpdateUserStatusDto {
  status: UserStatus;
}

class ReviewVerificationDto {
  status: VerificationStatus;
  comment?: string;
}

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @RequirePermissions(Permission.ADMIN_DASHBOARD_ACCESS)
  @ApiOperation({ summary: 'Consultation du tableau de bord d’administration globale' })
  @ApiResponse({ status: 200, description: 'Statistiques globales de la plateforme' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Rôle ADMIN requis' })
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('users')
  @RequirePermissions(Permission.ADMIN_USERS_MANAGE)
  @ApiOperation({ summary: 'Liste de tous les utilisateurs inscrits' })
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Patch('users/:id/status')
  @RequirePermissions(Permission.ADMIN_USERS_STATUS_UPDATE)
  @ApiOperation({ summary: 'Modification du statut d’un compte utilisateur (ACTIVE, SUSPENDED)' })
  async updateUserStatus(
    @Param('id') userId: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.adminService.updateUserStatus(userId, dto.status, admin.id);
  }

  @Get('verifications')
  @RequirePermissions(Permission.ADMIN_PROFESSIONALS_VERIFY)
  @ApiOperation({ summary: 'Liste des dossiers de vérification des professionnels' })
  async getVerifications() {
    return this.adminService.getVerifications();
  }

  @Post('verifications/:id/review')
  @RequirePermissions(Permission.ADMIN_PROFESSIONALS_VERIFY)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validation ou rejet des justificatifs d’un professionnel' })
  async reviewVerification(
    @Param('id') verificationId: string,
    @Body() dto: ReviewVerificationDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.adminService.reviewVerification(
      verificationId,
      admin.id,
      dto.status,
      dto.comment,
    );
  }

  @Get('audit-logs')
  @RequirePermissions(Permission.ADMIN_AUDIT_LOGS_VIEW)
  @ApiOperation({ summary: 'Consultation des journaux d’audit et de traçabilité' })
  async getAuditLogs() {
    return this.adminService.getAuditLogs();
  }
}
