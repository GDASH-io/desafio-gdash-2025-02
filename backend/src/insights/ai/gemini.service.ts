import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY não configurada no arquivo .env');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    // Usando Gemini 2.5 Flash-Lite - GRATUITO com maiores limites (1000 req/dia)
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
  }

  async generateInsights(weatherData: any[]): Promise<string> {
    // Preparar dados para o prompt
    const summary = this.prepareWeatherSummary(weatherData);

    // Variações de foco para gerar análises diferentes
    const focusVariations = [
      {
        focus: 'saúde e bem-estar',
        instructions: 'Foque em como o clima pode afetar a saúde, atividades físicas e bem-estar geral.',
      },
      {
        focus: 'atividades ao ar livre',
        instructions: 'Foque em recomendações para atividades externas, esportes e lazer.',
      },
      {
        focus: 'agricultura e jardinagem',
        instructions: 'Foque em como o clima afeta plantas, jardins e atividades agrícolas.',
      },
      {
        focus: 'planejamento diário',
        instructions: 'Foque em como as pessoas devem se preparar e planejar suas atividades diárias.',
      },
      {
        focus: 'comparação histórica',
        instructions: 'Foque em comparar os dados atuais com padrões históricos típicos da região.',
      },
    ];

    // Selecionar um foco aleatório
    const selectedFocus = focusVariations[Math.floor(Math.random() * focusVariations.length)];

    // Prompt para Gemini com variação
    const prompt = `
Você é um meteorologista especialista. Analise os seguintes dados climáticos e forneça insights valiosos para o usuário:

${summary}

**Foco desta análise: ${selectedFocus.focus}**
${selectedFocus.instructions}

Forneça:
1. Análise das tendências de temperatura e umidade
2. Alertas sobre condições extremas (se houver)
3. Recomendações práticas para os próximos dias (relacionadas ao foco)
4. Observações sobre padrões climáticos

Seja conciso, útil e amigável. Use markdown para formatar a resposta com títulos (##) e listas.
Adicione emojis relevantes para tornar a leitura mais agradável.
    `;

    try {
      console.log('🤖 Chamando Google Gemini para gerar insights...');
      console.log('📊 Foco da análise:', selectedFocus.focus);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('✅ Gemini respondeu com sucesso! Tamanho da resposta:', text.length, 'caracteres');
      return text;
    } catch (error) {
      console.error('❌ Erro ao gerar insights com Gemini:', error);
      throw new Error('Não foi possível gerar insights com IA. Tente novamente mais tarde.');
    }
  }

  private prepareWeatherSummary(data: any[]): string {
    // Calcular estatísticas
    const temps = data.map(d => d.temperature);
    const humidities = data.map(d => d.humidity);

    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);
    const avgHumidity = humidities.reduce((a, b) => a + b, 0) / humidities.length;

    return `
Período analisado: ${data.length} registros dos últimos 7 dias
Localização: ${data[0]?.location?.name || 'Florianópolis'}

Temperatura:
- Média: ${avgTemp.toFixed(1)}°C
- Mínima: ${minTemp.toFixed(1)}°C
- Máxima: ${maxTemp.toFixed(1)}°C

Umidade:
- Média: ${avgHumidity.toFixed(1)}%

Condições predominantes:
${this.getTopConditions(data)}

Dados de chuva:
${this.getRainInfo(data)}
    `;
  }

  private getTopConditions(data: any[]): string {
    const conditions = data.map(d => d.condition);
    const counts = conditions.reduce((acc, c) => {
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 3)
      .map(([condition, count]) => `- ${condition}: ${count} registros`)
      .join('\n');
  }

  private getRainInfo(data: any[]): string {
    const rainyDays = data.filter(d =>
      d.rainProbability > 50 ||
      d.condition?.toLowerCase().includes('rain') ||
      d.condition?.toLowerCase().includes('rainy') ||
      d.condition?.toLowerCase().includes('chuva')
    );

    return `${rainyDays.length} registros com probabilidade de chuva acima de 50%`;
  }
}
