import { IsNotEmpty, IsString, IsEnum, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { LegalCategory } from '@prisma/client';

export class CreateLegalResourceDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  legalReference: string;

  @IsNotEmpty()
  @IsString()
  officialSource: string;

  @IsNotEmpty()
  @IsEnum(LegalCategory)
  category: LegalCategory;

  @IsOptional()
  @IsString()
  language?: string = 'ar';

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean = true;
}
