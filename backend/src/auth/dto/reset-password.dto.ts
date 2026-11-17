import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Password reset token',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le jeton de réinitialisation est obligatoire' })
  token: string;

  @ApiProperty({
    example: 'NewSecurePassword123!',
    description: 'New password for the account',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  @MaxLength(64, { message: 'Le mot de passe ne peut dépasser 64 caractères' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
  })
  newPassword: string;
}
