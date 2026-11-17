import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  OrganizationService,
  UpdateOrganizationProfileDto,
} from './organization.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { Role } from '@prisma/client';
import { Permission } from '../auth/permissions/permissions.enum';

@ApiTags('Organization')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.ASSOCIATION, Role.HELP_CENTER)
@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('dashboard')
  @RequirePermissions(Permission.ORGANIZATION_PROFILE_MANAGE)
  @ApiOperation({ summary: 'Tableau de bord de l’association ou du centre d’aide' })
  @ApiResponse({ status: 200, description: 'Statistiques de l’organisme' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Rôles ASSOCIATION ou HELP_CENTER requis' })
  async getDashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.organizationService.getDashboard(user.id, user.role);
  }

  @Get('profile')
  @RequirePermissions(Permission.ORGANIZATION_PROFILE_MANAGE)
  @ApiOperation({ summary: 'Consultation de la fiche de l’organisme' })
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.organizationService.getProfile(user.id, user.role);
  }

  @Put('profile')
  @RequirePermissions(Permission.ORGANIZATION_PROFILE_MANAGE)
  @ApiOperation({ summary: 'Mise à jour des coordonnées et services proposés' })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateOrganizationProfileDto,
  ) {
    return this.organizationService.updateProfile(user.id, user.role, dto);
  }

  @Get('requests')
  @RequirePermissions(Permission.ORGANIZATION_REQUESTS_VIEW)
  @ApiOperation({ summary: 'Liste des demandes d’accompagnement social ou d’hébergement' })
  async getRequests(@CurrentUser() user: AuthenticatedUser) {
    return this.organizationService.getRequests(user.id, user.role);
  }
}
