import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'amina.bennani@example.ma', description: 'Registered email' })
  @IsEmail({}, { message: 'Adresse e-mail invalide' })
  @IsNotEmpty({ message: 'L’adresse e-mail est obligatoire' })
  email: string;
}
