import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiInsightService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY')!;
    this.genAI = new GoogleGenerativeAI(apiKey);
    
    // Configuração para resposta rápida e criativa
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7, 
        maxOutputTokens: 600,
      }
    });
  }

  async analyzeDailyLogs(logs: any[]): Promise<string> {
    const dataSummary = logs.map(log => {
      const time = new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return `[${time}] Temp:${log.temperature}°C, Umid:${log.humidity}%, radiação:${log.radiation}W/m², Vento:${log.wind_speed}km/h`;
    }).join('\n');

    const prompt = `
      Atue como um meteorologista especialista em eficiência energética fotovoltaica.
      Analise os dados climáticos abaixo:

      ${dataSummary}

      Tarefa:
      Identifique padrões que afetem a geração de energia solar (ex: nuvens reduzindo irradiação, calor excessivo reduzindo eficiência dos painéis, poeira/vento).
      
      Saída:
      Gere um insight conciso de no máximo 3 frases. 
      Foque no impacto operacional para uma usina solar neste momento.
      Não use formatação Markdown complexa, apenas texto corrido.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Erro Gemini:', error);
      return 'O oráculo do tempo está indisponível no momento. Tente novamente mais tarde.';
    }
  }
}