import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AssistanceType } from '@prisma/client';

export class CreateAssistanceRequestDto {
  @IsEnum(AssistanceType)
  @IsNotEmpty()
  typeAssistance: AssistanceType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  professionalId?: string;

  @IsString()
  @IsOptional()
  organizationId?: string;
}
