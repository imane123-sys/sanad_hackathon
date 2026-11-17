import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LegalService } from './legal.service';
import { QueryLegalResourceDto } from './dto/query-legal-resource.dto';
import { CreateLegalResourceDto } from './dto/create-legal-resource.dto';
import { UpdateLegalResourceDto } from './dto/update-legal-resource.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { Role } from '@prisma/client';
import { Permission } from '../auth/permissions/permissions.enum';

@ApiTags('Legal Information')
@Controller('legal')
export class LegalController {
  constructor(private readonly legalService: LegalService) {}

  @Get('resources')
  @ApiOperation({ summary: 'Recherche et consultation publique des ressources juridiques' })
  @ApiResponse({ status: 200, description: 'Liste paginée des ressources juridiques' })
  async getResources(@Query() query: QueryLegalResourceDto) {
    return this.legalService.findAll(query, false);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Liste des catégories de droit et décompte des ressources' })
  @ApiResponse({ status: 200, description: 'Statistiques des catégories juridiques' })
  async getCategories() {
    return this.legalService.getCategories();
  }

  @Get('resources/:id')
  @ApiOperation({ summary: 'Consultation détaillée d’une ressource juridique par identifiant' })
  @ApiResponse({ status: 200, description: 'Détails complets de la ressource légale' })
  @ApiResponse({ status: 404, description: 'Ressource légale non trouvée' })
  async getResourceById(@Param('id') id: string) {
    return this.legalService.findOne(id);
  }

  // =========================================================================
  // ADMINISTRATION ENDPOINTS
  // =========================================================================

  @Get('admin/resources')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.ADMIN_RESOURCES_MANAGE)
  @ApiOperation({ summary: 'Consultation administrative de toutes les ressources (y compris inactives)' })
  async getAdminResources(@Query() query: QueryLegalResourceDto) {
    return this.legalService.findAll(query, true);
  }

  @Post('admin/resources')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.ADMIN_RESOURCES_MANAGE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Création d’une nouvelle ressource juridique officielle' })
  async createResource(
    @Body() dto: CreateLegalResourceDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.legalService.create(dto, admin?.id);
  }

  @Put('admin/resources/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.ADMIN_RESOURCES_MANAGE)
  @ApiOperation({ summary: 'Mise à jour complète d’une ressource juridique' })
  async updateResource(
    @Param('id') id: string,
    @Body() dto: UpdateLegalResourceDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.legalService.update(id, dto, admin?.id);
  }

  @Patch('admin/resources/:id/verify')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.ADMIN_RESOURCES_MANAGE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validation et certification juridique d’une ressource (mise à jour de la date de vérification)' })
  async verifyResource(
    @Param('id') id: string,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.legalService.verify(id, admin?.id);
  }

  @Patch('admin/resources/:id/toggle-status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.ADMIN_RESOURCES_MANAGE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activation ou désactivation d’une ressource juridique' })
  async toggleResourceStatus(
    @Param('id') id: string,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.legalService.toggleStatus(id, admin?.id);
  }

  @Delete('admin/resources/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN)
  @RequirePermissions(Permission.ADMIN_RESOURCES_MANAGE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suppression définitive d’une ressource juridique' })
  async deleteResource(
    @Param('id') id: string,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.legalService.delete(id, admin?.id);
  }
}
