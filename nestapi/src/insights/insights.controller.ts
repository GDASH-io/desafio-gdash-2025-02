import { Body, Controller, Post } from '@nestjs/common';
import { InsightsService } from './insights.device';
import { CreateInsightDto } from './dto/create-insight.dto';

@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Post('generate')
  async generateWeatherAI(@Body() dto: CreateInsightDto) {
    const { current, forecast, question } = dto;

    const prompt = this.buildWeatherPrompt(current, forecast, question);

    const insight = await this.insightsService.generateInsight(prompt);
    return {
      status: 200,
      message: 'Weather insight generated successfully',
      body: JSON.parse(insight),
    };

  }

  private buildWeatherPrompt(current: any, forecast: any[], question?: string) {
      return `
    Você é uma IA meteorológica avançada, especializada em análise de clima e recomendações práticas.

    Retorne **somente em JSON válido**, sem texto adicional, no seguinte formato:

    {
      "climaAtual": {
        "temperatura": ${current.temperature},
        "umidade": ${current.humidity},
        "vento": ${current.wind_speed ?? 'Desconhecido'},
        "chuva": ${current.rain_probability ?? 'Desconhecida'},
        "condicao": "${current.sky_condition ?? 'Desconhecida'}",
        "icone": "sol|nuvem|chuva|neve|tempestade",
        "corTema": "#hex"
      },
      "analise": "...",
      "recomendacoes": ["...", "..."],
      "alertas": ["...", "..."],
      "resumo": "...",
      "previsaoProximosDias": [
        {
          "dia": "YYYY-MM-DD",
          "temperatura": "...",
          "chuva": "...",
          "vento": "...",
          "condicao": "...",
          "icone": "sol|nuvem|chuva|neve|tempestade",
          "corTema": "#hex"
        }
      ]
    }

    ### INSTRUÇÕES:
    1. Analise o clima atual e os próximos dias.
    2. Inclua alertas se houver risco de chuva forte, ventos altos ou temperaturas extremas.
    3. Gere recomendações práticas para o usuário.
    4. Inclua sempre um resumo curto (1-2 frases) fácil de exibir no Dashboard.
    5. Para cada clima, sugira um ícone e uma cor de tema para visualização.
    6. Utilize os dados da pergunta do usuário, se houver, para contextualizar a análise.
    7. Não inclua explicações fora do JSON.
    8. Seja conciso, direto e prático.

    ### CLIMA ATUAL
    Temperatura: ${current.temperature}°C  
    Umidade: ${current.humidity}%  
    Vento: ${current.wind_speed ?? 'Desconhecido'} km/h  
    Chance de chuva: ${current.rain_probability ?? 'Desconhecida'}%  
    Condição: ${current.sky_condition ?? 'Desconhecida'}

    ### PRÓXIMOS DIAS
    ${forecast.map(f => `- ${f.time}: ${f.temperature}°C, chuva ${f.rain_probability ?? 'N/A'}%, vento ${f.wind_speed ?? 'N/A'} km/h, condição ${f.sky_condition}`).join('\n')}

    ### PERGUNTA DO USUÁRIO
    ${question ?? 'Nenhuma'}
      `;
    }



}
