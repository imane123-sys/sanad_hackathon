import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { LegalCategory } from '@prisma/client';

export class QueryLegalResourceDto {
  @IsOptional()
  @IsEnum(LegalCategory)
  category?: LegalCategory;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  verificationStatus?: 'all' | 'verified' | 'unverified';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
