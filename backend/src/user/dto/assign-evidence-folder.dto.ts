import { IsOptional, IsString } from 'class-validator';

export class AssignEvidenceFolderDto {
  @IsOptional()
  @IsString()
  folderId?: string | null;
}
