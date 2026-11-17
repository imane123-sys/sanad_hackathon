import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateConversationDto {
  @ApiPropertyOptional({
    description: 'Titre de la conversation',
    example: 'Consultation ordonnance de protection',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    description: 'Langue préférée de l’échange (ar, fr, darija)',
    example: 'ar',
    default: 'ar',
  })
  @IsString()
  @IsOptional()
  language?: string;
}

export class SendMessageDto {
  @ApiProperty({
    description: 'Contenu du message envoyé par l’utilisatrice',
    example: 'زوجي يهددني بالطرد وأحتاج معرفة حقوقي وفق القانون 103-13',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: 'Langue de réponse souhaitée (ar, fr, darija)',
    example: 'ar',
  })
  @IsString()
  @IsOptional()
  language?: string;
}
