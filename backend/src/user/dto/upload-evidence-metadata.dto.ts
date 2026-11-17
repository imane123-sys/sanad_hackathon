import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadEvidenceMetadataDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  folderId?: string;
}
