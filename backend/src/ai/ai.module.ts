import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { GeminiProvider } from './providers/gemini.provider';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AiController],
  providers: [AiService, GeminiProvider],
  exports: [AiService],
})
export class AiModule {}
