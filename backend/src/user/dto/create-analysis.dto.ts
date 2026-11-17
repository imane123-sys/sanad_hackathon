import { IsNotEmpty, IsObject, IsOptional, IsBoolean, IsString } from 'class-validator';

export class CreateAnalysisDto {
  @IsObject()
  @IsNotEmpty()
  analysisContent: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  consentGranted?: boolean;

  @IsOptional()
  @IsString()
  policyVersion?: string;
}
