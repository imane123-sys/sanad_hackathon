import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  Matches,
} from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'amina.bennani@example.ma', description: 'User email address' })
  @IsEmail({}, { message: 'Adresse e-mail invalide' })
  @IsNotEmpty({ message: 'L’adresse e-mail est obligatoire' })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'User password (min 8 characters, with letters and numbers)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  @MaxLength(64, { message: 'Le mot de passe ne peut dépasser 64 caractères' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
  })
  password: string;

  @ApiPropertyOptional({ example: 'Amina', description: 'First name' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Bennani', description: 'Last name' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: '+212600112233', description: 'Phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    enum: Role,
    default: Role.USER,
    description: 'User role in SANAD platform',
  })
  @IsEnum(Role, { message: 'Rôle non valide' })
  @IsOptional()
  role?: Role;

  @ApiPropertyOptional({
    example: 'ar',
    default: 'ar',
    description: 'Preferred language (ar | fr)',
  })
  @IsString()
  @IsOptional()
  preferredLanguage?: string;
}
