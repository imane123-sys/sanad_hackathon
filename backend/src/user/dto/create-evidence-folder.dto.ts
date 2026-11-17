import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateEvidenceFolderDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
