import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { CreateAssistanceRequestDto } from './dto/create-assistance-request.dto';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { Request } from 'express';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Tableau de bord personnel et résumé de l’utilisatrice' })
  @ApiResponse({ status: 200, description: 'Statistiques et données réelles de l’utilisatrice' })
  async getDashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.getDashboard(user.id);
  }

  @Get('evidences')
  @ApiOperation({ summary: 'Liste des preuves numériques et pièces du coffre-fort' })
  async getEvidences(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.getEvidences(user.id);
  }

  @Post('evidences')
  @ApiOperation({ summary: 'Enregistrement sécurisé d’une preuve avec empreinte SHA-256' })
  async createEvidence(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateEvidenceDto,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress;
    return this.userService.createEvidence(user.id, dto, ipAddress);
  }

  @Delete('evidences/:id')
  @ApiOperation({ summary: 'Suppression sécurisée d’un élément de preuve' })
  async deleteEvidence(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.userService.deleteEvidence(user.id, id);
  }

  @Get('assistance-requests')
  @ApiOperation({ summary: 'Historique des demandes d’assistance de l’utilisatrice' })
  async getAssistanceRequests(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.getAssistanceRequests(user.id);
  }

  @Post('assistance-requests')
  @ApiOperation({ summary: 'Création d’une nouvelle demande d’assistance' })
  async createAssistanceRequest(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAssistanceRequestDto,
  ) {
    return this.userService.createAssistanceRequest(user.id, dto);
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Consultation des notifications discrètes' })
  async getNotifications(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.getNotifications(user.id);
  }

  @Patch('notifications/:id/read')
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  async markNotificationRead(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.userService.markNotificationRead(user.id, id);
  }

  @Patch('notifications/read-all')
  @ApiOperation({ summary: 'Marquer toutes les notifications comme lues' })
  async markAllNotificationsRead(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.markAllNotificationsRead(user.id);
  }

  @Get('analysis')
  @ApiOperation({ summary: 'Résultats des analyses de situation assistées par IA' })
  async getAnalysisResults(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.getAnalysisResults(user.id);
  }

  @Post('analysis')
  @ApiOperation({ summary: 'Enregistrer une nouvelle analyse de situation' })
  async createAnalysis(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAnalysisDto,
  ) {
    return this.userService.createAnalysis(user.id, dto);
  }

  @Get('resources')
  @ApiOperation({ summary: 'Annuaire des professionnels, centres et numéros d’urgence' })
  async getResources(
    @Query('city') city?: string,
    @Query('category') category?: string,
    @Query('query') query?: string,
  ) {
    return this.userService.getResources({ city, category, query });
  }
}
