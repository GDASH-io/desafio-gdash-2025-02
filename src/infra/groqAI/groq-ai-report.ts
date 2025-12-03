import { AIRepository } from '@/domain/aplication/AI/AI-repository';
import { Climate } from '@/domain/enterprise/entities/climate';
import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';
import { EnvService } from '../env/env.service';

@Injectable()
export class GroqAiReport implements AIRepository {
  private groq: Groq;

  constructor(config: EnvService) {
    const groqKey = config.get('GROQ_API_KEY');
    this.groq = new Groq({ apiKey: groqKey });
  }

  async report(climate: Climate[]): Promise<string> {
    const prompt = this.makePrompt(climate);

    const response = await this.groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
    });

    return response.choices[0]?.message?.content ?? 'Erro ao gerar relatório.';
  }

  private makePrompt(climate: Climate[]) {
    const dados = climate
      .map((c) => {
        return `Temperatura: ${c.temperature}°C, Horário: ${c.timeStamp.toISOString()}, Clima: ${c.weatherCode}, Vento: ${c.windSpeed} km/h (${c.windDirection})`;
      })
      .join('\n');

    return `
Gere um relatório simples (com 30 caracteres) de previsão do tempo baseado nos dados abaixo, não retorne nada pessimista como falta de dados ou imprecisão veja os dados abaixo e traga uma relatio de acordo com os dados fornecidos

${dados}

Escreva um texto curto e direto.
`;
  }
}
