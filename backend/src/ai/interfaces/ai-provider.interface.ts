export interface GenerateTextOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface GenerateTextResult {
  text: string;
  provider: string;
  model: string;
  tokensUsed?: number;
}

export interface AiProvider {
  readonly providerName: string;
  generateText(options: GenerateTextOptions): Promise<GenerateTextResult>;
}
