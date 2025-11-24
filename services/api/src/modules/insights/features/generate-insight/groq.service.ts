import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqChatRequest {
  model: string;
  messages: GroqMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

interface GroqChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: GroqMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class GroqService {
  private readonly logger = new Logger(GroqService.name);
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('GROQ_API_KEY') || '';
    this.model = this.configService.get<string>('GROQ_MODEL') || 'llama-3.3-70b-versatile';
    this.baseUrl = this.configService.get<string>('GROQ_BASE_URL') || 'https://api.groq.com/openai/v1';
    
    if (!this.apiKey) {
      this.logger.warn('GROQ_API_KEY não está configurada!');
    }
    
    this.logger.log(`Groq Service inicializado com modelo: ${this.model}`);
  }

  async chat(messages: GroqMessage[], options?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  }): Promise<string> {
    if (!this.apiKey) {
      throw new BadRequestException('GROQ_API_KEY não está configurada. Configure a variável de ambiente GROQ_API_KEY.');
    }

    try {
      const requestData: GroqChatRequest = {
        model: this.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1024,
        top_p: options?.topP ?? 1,
      };

      this.logger.debug(`Groq API Request to model ${this.model}`);

      const { data } = await firstValueFrom(
        this.httpService.post<GroqChatResponse>(
          `${this.baseUrl}/chat/completions`,
          requestData,
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      this.logger.debug(`Groq API Response: ${JSON.stringify(data)}`);

      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new BadRequestException('Resposta vazia da API Groq');
      }

      return content;
    } catch (error) {
      const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      this.logger.error(`Groq API Error: ${errorDetails}`, error.stack);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException(
        `Falha ao comunicar com API Groq: ${errorDetails}`,
      );
    }
  }

  async generateWeatherInsight(
    weatherData: unknown[],
    context: string,
    customPrompt?: string,
  ): Promise<string> {
    const systemPrompt = `Você é um especialista em meteorologia e análise de dados climáticos. 
Sua tarefa é analisar dados meteorológicos e fornecer insights úteis, alertas e recomendações.
Responda sempre em português brasileiro de forma clara, objetiva e profissional.`;

    const contextPrompts = {
      general: 'Forneça uma análise geral das condições meteorológicas.',
      alerts: 'Identifique e destaque alertas importantes sobre as condições meteorológicas (temperaturas extremas, ventos fortes, etc.).',
      recommendations: 'Forneça recomendações práticas baseadas nas condições meteorológicas (vestuário, atividades, cuidados).',
      trends: 'Analise tendências e padrões nos dados meteorológicos apresentados.',
    };

    const userPrompt = customPrompt || contextPrompts[context] || contextPrompts.general;

    const dataDescription = JSON.stringify(weatherData, null, 2);

    const messages: GroqMessage[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `${userPrompt}\n\nDados meteorológicos:\n${dataDescription}\n\nPor favor, forneça uma análise detalhada e insights úteis.`,
      },
    ];

    return this.chat(messages, {
      temperature: 0.7,
      maxTokens: 1000,
    });
  }
}
