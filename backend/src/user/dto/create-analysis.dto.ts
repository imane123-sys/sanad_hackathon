import { IsNotEmpty, IsObject } from 'class-validator';

export class CreateAnalysisDto {
  @IsObject()
  @IsNotEmpty()
  analysisContent: Record<string, any>;
}
