import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly apiKey: string;
  private readonly apiUrl = this.configService.get<string>('GEMINI_API_URL');

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY'); 
    if (!this.apiKey) {
      console.error("ERRO: GEMINI_API_KEY não configurada no .env");
    }
  }

  async generateInsight(weatherData: string): Promise<string> {
    if (!this.apiKey) {
        return 'Chave de IA não configurada. Insights desativados.';
    }
    
    // Instrução detalhada para o modelo
    const systemPrompt = `Você é um analista de dados climáticos focado em energia fotovoltaica. Analise os dados históricos de clima fornecidos em JSON (últimas horas) e gere um resumo conciso (máximo 3 frases). Foco na tendência de temperatura e umidade, e o impacto potencial na produção de energia. Use emojis.`;
    
    // O histórico de dados é o que a IA vai analisar
    const userQuery = `Informe o nome da cidade, e analise este histórico de clima (Timestamp/Temperatura/Umidade/Latitude/Longitude): ${weatherData}`;

    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
    };

    try {
      const response = await axios.post(`${this.apiUrl}?key=${this.apiKey}`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      // Extrair o texto gerado
      const generatedText = response.data.candidates[0].content.parts[0].text;
      return generatedText.trim();

    } catch (error) {
      console.error('Erro na chamada da API Gemini:', error.message);
      return '❌ Erro na API de IA. Retornando análise simples.';
    }
  }
}