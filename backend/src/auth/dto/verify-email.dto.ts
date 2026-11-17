import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Email verification token received by user',
  })
  @IsString()
  @IsNotEmpty({ message: 'Le jeton de vérification est obligatoire' })
  token: string;
}
