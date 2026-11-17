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
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import * as fs from 'fs';
import { UserService } from './user.service';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { CreateEvidenceFolderDto } from './dto/create-evidence-folder.dto';
import { CreateEvidenceShareDto } from './dto/create-evidence-share.dto';
import { AssignEvidenceFolderDto } from './dto/assign-evidence-folder.dto';
import { UploadEvidenceMetadataDto } from './dto/upload-evidence-metadata.dto';
import { CreateAssistanceRequestDto } from './dto/create-assistance-request.dto';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { EvaluateSituationDto } from './dto/evaluate-situation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

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
  async getEvidences(
    @CurrentUser() user: AuthenticatedUser,
    @Query('folderId') folderId?: string,
  ) {
    return this.userService.getEvidences(user.id, folderId);
  }

  @Post('evidences/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Téléversement sécurisé de fichier dans le coffre-fort privé avec empreinte SHA-256' })
  async uploadEvidence(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: any,
    @Body() body: UploadEvidenceMetadataDto,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress;
    return this.userService.uploadEvidence(user.id, file, body, ipAddress);
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

  @Get('evidences/shared/with-me')
  @ApiOperation({ summary: 'Liste des pièces probatoires partagées confidentiellement avec l’utilisatrice' })
  async getSharedWithMe(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.getSharedWithMe(user.id);
  }

  @Get('evidences/:id')
  @ApiOperation({ summary: 'Consultation détaillée d’un élément de preuve' })
  async getEvidenceById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.userService.getEvidenceById(user.id, user.role, id);
  }

  @Get('evidences/:id/download')
  @ApiOperation({ summary: 'Téléchargement sécurisé et contrôlé d’un fichier de preuve original' })
  async downloadEvidence(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress;
    const info = await this.userService.downloadOrStreamEvidence(user.id, user.role, id, true, ipAddress);

    if (fs.existsSync(info.filePath)) {
      res.setHeader('Content-Type', info.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(info.fileName)}"`);
      const stream = fs.createReadStream(info.filePath);
      return stream.pipe(res);
    } else {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(info.fileName)}"`);
      return res.send(`SANAD Cryptographic Preservation Placeholder - SHA256: ${info.sha256}`);
    }
  }

  @Get('evidences/:id/view')
  @ApiOperation({ summary: 'Visualisation confidentielle directe en streaming' })
  async viewEvidence(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress;
    const info = await this.userService.downloadOrStreamEvidence(user.id, user.role, id, false, ipAddress);

    if (fs.existsSync(info.filePath)) {
      res.setHeader('Content-Type', info.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(info.fileName)}"`);
      const stream = fs.createReadStream(info.filePath);
      return stream.pipe(res);
    } else {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(info.fileName)}"`);
      return res.send(`SANAD Cryptographic Preservation Placeholder - SHA256: ${info.sha256}`);
    }
  }

  @Get('evidences/:id/verify')
  @ApiOperation({ summary: 'Vérification en direct de l’empreinte cryptographique SHA-256' })
  async verifyEvidence(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress;
    return this.userService.verifyEvidenceHash(user.id, user.role, id, ipAddress);
  }

  @Get('evidences/:id/logs')
  @ApiOperation({ summary: 'Historique exhaustif de traçabilité et d’accès à la preuve' })
  async getEvidenceAccessLogs(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.userService.getEvidenceAccessLogs(user.id, user.role, id);
  }

  @Post('evidences/:id/share')
  @ApiOperation({ summary: 'Partage sécurisé d’une preuve avec une avocate ou psychologue' })
  async createEvidenceShare(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: CreateEvidenceShareDto,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress;
    return this.userService.createEvidenceShare(user.id, id, dto, ipAddress);
  }

  @Get('evidences/:id/shares')
  @ApiOperation({ summary: 'Liste des autorisations de partage d’une preuve' })
  async getEvidenceShares(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.userService.getEvidenceShares(user.id, user.role, id);
  }

  @Patch('evidences/shares/:shareId/revoke')
  @ApiOperation({ summary: 'Révocation immédiate d’une autorisation de partage' })
  async revokeEvidenceShare(
    @CurrentUser() user: AuthenticatedUser,
    @Param('shareId') shareId: string,
  ) {
    return this.userService.revokeEvidenceShare(user.id, shareId);
  }

  @Delete('evidences/:id')
  @ApiOperation({ summary: 'Suppression sécurisée d’un élément de preuve' })
  async deleteEvidence(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.userService.deleteEvidence(user.id, id);
  }

  // ==========================================
  // DOSSIERS DE PREUVES (EVIDENCE FOLDERS)
  // ==========================================

  @Get('evidence-folders')
  @ApiOperation({ summary: 'Liste des dossiers d’organisation des preuves' })
  async getEvidenceFolders(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.getEvidenceFolders(user.id);
  }

  @Post('evidence-folders')
  @ApiOperation({ summary: 'Création d’un nouveau dossier de preuves' })
  async createEvidenceFolder(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateEvidenceFolderDto,
  ) {
    return this.userService.createEvidenceFolder(user.id, dto);
  }

  @Delete('evidence-folders/:id')
  @ApiOperation({ summary: 'Suppression d’un dossier de preuves' })
  async deleteEvidenceFolder(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.userService.deleteEvidenceFolder(user.id, id);
  }

  @Patch('evidences/:id/folder')
  @ApiOperation({ summary: 'Affectation d’un élément de preuve à un dossier' })
  async assignEvidenceFolder(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: AssignEvidenceFolderDto,
  ) {
    return this.userService.assignEvidenceFolder(user.id, id, dto.folderId);
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

  @Post('analysis/evaluate')
  @ApiOperation({ summary: 'Évaluation en direct de la situation sans enregistrement automatique (Loi 09-08)' })
  async evaluateSituation(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: EvaluateSituationDto,
  ) {
    return this.userService.evaluateSituation(dto);
  }

  @Get('analysis')
  @ApiOperation({ summary: 'Résultats des analyses de situation assistées par IA' })
  async getAnalysisResults(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.getAnalysisResults(user.id);
  }

  @Post('analysis')
  @ApiOperation({ summary: 'Enregistrer une nouvelle analyse avec consentement explicite (ConsentHistory)' })
  async createAnalysis(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAnalysisDto,
    @Req() req: Request,
  ) {
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress;
    return this.userService.createAnalysis(user.id, dto, ipAddress);
  }

  @Delete('analysis/:id')
  @ApiOperation({ summary: 'Suppression sécurisée d’un résultat d’analyse (Droit à l’oubli)' })
  async deleteAnalysis(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.userService.deleteAnalysis(user.id, id);
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
