import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

export interface WeatherInsightsInput {
  avgTemp: number;
  avgHum: number;
  avgWind: number;
  trendText: string;
  classification: string;
  alerts: string[];
  comfortScore: number;
  totalRecords: number;
}

@Injectable()
export class AIService {
  private openai: OpenAI | null = null;
  private isConfigured: boolean = false;

  constructor() {
    // 🚀 GROQ API - Gratuita e ultra rápida!
    const apiKey = process.env.GROQ_API_KEY;


    console.log('🔍 [AI] Verificando configuração do Groq...');
    console.log(`🔍 [AI] Chave presente: ${apiKey ? 'Sim' : 'Não'}`);
    console.log(`🔍 [AI] Tamanho da chave: ${apiKey?.length || 0} caracteres`);

    if (apiKey && apiKey.length > 20) {
      try {
        this.openai = new OpenAI({ 
          apiKey: apiKey.trim(),
          baseURL: 'https://api.groq.com/openai/v1' // 👈 MUDANÇA 1: URL do Groq
        });
        this.isConfigured = true;
        console.log('✅ [AI] Groq configurado com sucesso!');
      } catch (error) {
        console.error('❌ [AI] Erro ao configurar Groq:', error.message);
        this.isConfigured = false;
      }
    } else {
      console.warn('⚠️  [AI] GROQ_API_KEY não configurada ou inválida');
      console.warn('⚠️  [AI] Sistema funcionará com insights básicos');
      this.isConfigured = false;
    }
  }

  async generateWeatherInsights(data: WeatherInsightsInput): Promise<string> {
    // Se não tiver Groq, usar fallback
    if (!this.isConfigured || !this.openai) {
      console.log('📝 [AI] Gerando insights básicos (sem IA)');
      return this.generateBasicInsights(data);
    }

    const prompt = `
Você é um assistente meteorológico especializado. Analise os dados climáticos das últimas 24h e gere insights úteis em português do Brasil:

**Dados analisados:**
- Temperatura média: ${data.avgTemp.toFixed(1)}°C
- Umidade média: ${data.avgHum.toFixed(1)}%
- Vento médio: ${data.avgWind.toFixed(1)} km/h
- Tendência: ${data.trendText}
- Classificação: ${data.classification}
- Índice de conforto: ${data.comfortScore}/100
- Alertas ativos: ${data.alerts.length ? data.alerts.join(', ') : 'Nenhum'}
- Total de medições: ${data.totalRecords}

**Gere um relatório com:**
1. Um resumo narrativo do clima atual (2-3 frases)
2. Recomendações práticas para as próximas horas
3. Análise de conforto térmico e bem-estar

Seja conciso, informativo e amigável. Use emojis quando apropriado.
Formato: texto corrido, sem marcadores ou seções.
`;

    try {
      console.log('🤖 [AI] Chamando Groq Llama-3...');
      
      const completion = await this.openai.chat.completions.create({
        model: 'llama-3.3-70b-versatile', // 👈 MUDANÇA 2: Modelo Groq
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 300,
      });

      const aiText = completion.choices[0]?.message?.content;
      
      if (aiText) {
        console.log('✅ [AI] Insights gerados pelo Groq com sucesso!');
        return aiText;
      }

      console.warn('⚠️  [AI] Resposta vazia do Groq - usando fallback');
      return this.generateBasicInsights(data);
      
    } catch (error) {
      console.error('❌ [AI] Erro ao chamar Groq:', error.message);
      return this.generateBasicInsights(data);
    }
  }

  private generateBasicInsights(data: WeatherInsightsInput): string {
    const emoji = this.getWeatherEmoji(data.classification);
    
    let text = `${emoji} Nas últimas 24h, registramos temperatura média de ${data.avgTemp.toFixed(1)}°C, caracterizando um clima ${data.classification}. `;
    
    text += `${data.trendText}. `;
    
    if (data.alerts.length > 0) {
      text += `⚠️ Alertas: ${data.alerts.join(' ')} `;
    } else {
      text += `✅ Não há alertas ativos no momento. `;
    }
    
    text += `O índice de conforto térmico está em ${data.comfortScore}/100. `;
    
    // Recomendações baseadas nas condições
    if (data.avgTemp > 30) {
      text += `Recomenda-se hidratação constante e evitar exposição solar prolongada.`;
    } else if (data.avgTemp < 15) {
      text += `Vista-se adequadamente para o frio e proteja-se das baixas temperaturas.`;
    } else {
      text += `Condições favoráveis para atividades ao ar livre.`;
    }

    return text;
  }

  private getWeatherEmoji(classification: string): string {
    const emojiMap: { [key: string]: string } = {
      'muito quente': '🔥',
      'quente': '☀️',
      'agradável': '🌤️',
      'frio': '🌥️',
      'muito frio': '❄️',
    };
    return emojiMap[classification.toLowerCase()] || '🌡️';
  }
}
