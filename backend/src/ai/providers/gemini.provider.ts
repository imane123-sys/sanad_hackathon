import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AiProvider, GenerateTextOptions, GenerateTextResult } from '../interfaces/ai-provider.interface';

@Injectable()
export class GeminiProvider implements AiProvider {
  readonly providerName = 'gemini';
  private readonly logger = new Logger(GeminiProvider.name);
  private client: GoogleGenerativeAI | null = null;
  private readonly modelName: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('AI_API_KEY');
    this.modelName = this.configService.get<string>('AI_MODEL', 'gemini-1.5-pro');

    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      this.client = new GoogleGenerativeAI(apiKey);
      this.logger.log(`Gemini provider initialized with model: ${this.modelName}`);
    } else {
      this.logger.warn(
        'AI_API_KEY is not set or using placeholder. Calls to AI service will throw an error until a valid key is provided in .env.',
      );
    }
  }

  async generateText(options: GenerateTextOptions): Promise<GenerateTextResult> {
    if (!this.client) {
      const apiKey = this.configService.get<string>('AI_API_KEY');
      if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        throw new Error(
          'Gemini AI API key is not configured. Please set a valid AI_API_KEY in the backend .env file.',
        );
      }
      this.client = new GoogleGenerativeAI(apiKey);
    }

    try {
      const model = this.client.getGenerativeModel({
        model: this.modelName,
        systemInstruction: options.systemInstruction,
        generationConfig: {
          temperature: options.temperature ?? this.configService.get<number>('AI_TEMPERATURE', 0.7),
          maxOutputTokens:
            options.maxOutputTokens ?? this.configService.get<number>('AI_MAX_OUTPUT_TOKENS', 2048),
        },
      });

      const response = await model.generateContent(options.prompt);
      const text = response.response.text();
      const tokensUsed = response.response.usageMetadata?.totalTokenCount;

      return {
        text,
        provider: this.providerName,
        model: this.modelName,
        tokensUsed,
      };
    } catch (error) {
      this.logger.error(`Gemini generation failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
