import { IsNotEmpty, IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class EvaluateSituationDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsArray()
  violenceTypes?: string[];

  @IsOptional()
  @IsString()
  cohabitationStatus?: string;

  @IsOptional()
  @IsBoolean()
  hasChildren?: boolean;

  @IsOptional()
  @IsString()
  dangerUrgency?: string;

  @IsOptional()
  @IsBoolean()
  hasMedicalCertificate?: boolean;

  @IsOptional()
  @IsBoolean()
  hasEvidence?: boolean;

  @IsOptional()
  @IsString()
  language?: string;
}
