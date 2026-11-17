import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { GeneratePromptDto, GeneratePromptResponseDto } from './dto/prompt.dto';
import { CreateConversationDto, SendMessageDto } from './dto/conversation.dto';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@ApiTags('AI Assistant / Assistant IA')
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly jwtService: JwtService,
  ) {}

  private extractUserId(req: Request): string | undefined {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded: any = this.jwtService.decode(token);
        return decoded?.sub;
      } catch {
        return undefined;
      }
    }
    return undefined;
  }

  @Get('status')
  @ApiOperation({ summary: 'Vérifier l’état du moteur d’IA et le fournisseur actif' })
  @ApiResponse({ status: 200, description: 'Statut du fournisseur d’IA' })
  getStatus() {
    return {
      status: 'active',
      activeProvider: this.aiService.getProviderName(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('legal-resources')
  @ApiOperation({ summary: 'Consulter le corpus juridique marocain vérifié (Loi 103-13, Moudawana, Code Pénal)' })
  getLegalCorpus() {
    return {
      resources: this.aiService.getLegalCorpus(),
      timestamp: new Date().toISOString(),
    };
  }

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Générer une réponse sécurisée orientée droit marocain' })
  @ApiResponse({
    status: 200,
    description: 'Réponse générée avec minimisation des données et ancrage légal',
    type: GeneratePromptResponseDto,
  })
  async generate(@Body() dto: GeneratePromptDto): Promise<GeneratePromptResponseDto> {
    return this.aiService.generate(dto);
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Créer un nouveau fil de conversation sécurisé' })
  async createConversation(
    @Body() dto: CreateConversationDto,
    @Req() req: Request,
  ) {
    const userId = this.extractUserId(req);
    return this.aiService.createConversation(userId || null, dto.title, dto.language);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Lister les fils de conversation de l’utilisatrice' })
  async getConversations(@Req() req: Request) {
    const userId = this.extractUserId(req);
    if (!userId) {
      return [];
    }
    return this.aiService.getConversations(userId);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Consulter un fil de conversation et ses messages' })
  async getConversation(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const userId = this.extractUserId(req);
    return this.aiService.getConversation(id, userId);
  }

  @Delete('conversations/:id')
  @ApiOperation({ summary: 'Supprimer un fil de conversation en toute discrétion' })
  async deleteConversation(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const userId = this.extractUserId(req);
    return this.aiService.deleteConversation(id, userId || '');
  }

  @Post('conversations/:id/messages')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Envoyer un message dans une conversation avec analyse de danger et ancrage juridique' })
  async sendMessage(
    @Param('id') conversationId: string,
    @Body() dto: SendMessageDto,
    @Req() req: Request,
  ) {
    const userId = this.extractUserId(req);
    return this.aiService.sendMessage(conversationId, dto, userId);
  }
}
