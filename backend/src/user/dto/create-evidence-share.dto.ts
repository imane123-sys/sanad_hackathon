import { IsNotEmpty, IsString, IsOptional, IsEnum, IsInt, Min, Max, IsEmail } from 'class-validator';
import { SharePermissionType } from '@prisma/client';

export class CreateEvidenceShareDto {
  @IsOptional()
  @IsString()
  recipientId?: string;

  @IsOptional()
  @IsEmail()
  recipientEmail?: string;

  @IsOptional()
  @IsEnum(SharePermissionType)
  permission?: SharePermissionType = SharePermissionType.READ_ONLY;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  validDays?: number = 7;
}
