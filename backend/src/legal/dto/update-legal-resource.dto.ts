import { IsOptional, IsString, IsEnum, IsBoolean, IsDateString } from 'class-validator';
import { LegalCategory } from '@prisma/client';

export class UpdateLegalResourceDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  legalReference?: string;

  @IsOptional()
  @IsString()
  officialSource?: string;

  @IsOptional()
  @IsEnum(LegalCategory)
  category?: LegalCategory;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
