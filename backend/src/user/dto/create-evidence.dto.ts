import { IsString, IsNotEmpty, IsOptional, IsNumber, MinLength, MaxLength } from 'class-validator';

export class CreateEvidenceDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @IsNumber()
  size: number;

  @IsString()
  @MinLength(64)
  @MaxLength(64)
  sha256: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  folderId?: string;
}
