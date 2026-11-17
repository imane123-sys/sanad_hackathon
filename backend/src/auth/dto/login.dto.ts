import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'amina.bennani@example.ma', description: 'User registered email' })
  @IsEmail({}, { message: 'Adresse e-mail invalide' })
  @IsNotEmpty({ message: 'L’adresse e-mail est obligatoire' })
  email: string;

  @ApiProperty({ example: 'Password123!', description: 'User password' })
  @IsString()
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  password: string;

  @ApiPropertyOptional({
    example: 'iPhone 15 / Safari on iOS',
    description: 'Client device information',
  })
  @IsString()
  @IsOptional()
  deviceInfo?: string;
}
