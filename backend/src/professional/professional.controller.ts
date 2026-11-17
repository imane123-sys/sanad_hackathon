import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ProfessionalService,
  UpdateProfessionalProfileDto,
  CreateServiceDto,
} from './professional.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { Role, AssistanceStatus } from '@prisma/client';
import { Permission } from '../auth/permissions/permissions.enum';

class UpdateStatusDto {
  status: AssistanceStatus;
  comment?: string;
}

@ApiTags('Professional')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.LAWYER, Role.PSYCHOLOGIST)
@Controller('professional')
export class ProfessionalController {
  constructor(private readonly professionalService: ProfessionalService) {}

  @Get('dashboard')
  @RequirePermissions(Permission.PROFESSIONAL_REQUESTS_VIEW)
  @ApiOperation({ summary: 'Tableau de bord de l’avocate ou du psychologue' })
  @ApiResponse({ status: 200, description: 'Statistiques du professionnel' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Rôles LAWYER ou PSYCHOLOGIST requis' })
  async getDashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.professionalService.getDashboard(user.id, user.role);
  }

  @Get('profile')
  @RequirePermissions(Permission.PROFESSIONAL_PROFILE_MANAGE)
  @ApiOperation({ summary: 'Consultation du profil professionnel et statut de validation' })
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.professionalService.getProfile(user.id, user.role);
  }

  @Put('profile')
  @RequirePermissions(Permission.PROFESSIONAL_PROFILE_MANAGE)
  @ApiOperation({ summary: 'Mise à jour du profil professionnel' })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfessionalProfileDto,
  ) {
    return this.professionalService.updateProfile(user.id, user.role, dto);
  }

  @Get('services')
  @RequirePermissions(Permission.PROFESSIONAL_SERVICES_MANAGE)
  @ApiOperation({ summary: 'Liste des prestations et honoraires proposés' })
  async getServices(@CurrentUser() user: AuthenticatedUser) {
    return this.professionalService.getServices(user.id, user.role);
  }

  @Post('services')
  @RequirePermissions(Permission.PROFESSIONAL_SERVICES_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Création d’un service ou d’une modalité d’accompagnement' })
  async createService(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateServiceDto,
  ) {
    return this.professionalService.createService(user.id, user.role, dto);
  }

  @Get('requests')
  @RequirePermissions(Permission.PROFESSIONAL_REQUESTS_VIEW)
  @ApiOperation({ summary: 'Liste des demandes d’accompagnement adressées au professionnel' })
  async getRequests(@CurrentUser() user: AuthenticatedUser) {
    return this.professionalService.getAssignedRequests(user.id, user.role);
  }

  @Patch('requests/:id/status')
  @RequirePermissions(Permission.PROFESSIONAL_REQUESTS_HANDLE)
  @ApiOperation({ summary: 'Mise à jour du statut d’une demande (ACCEPTEE, REFUSEE, etc.)' })
  async updateRequestStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') requestId: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.professionalService.updateRequestStatus(
      user.id,
      user.role,
      requestId,
      dto.status,
      dto.comment,
    );
  }
}
