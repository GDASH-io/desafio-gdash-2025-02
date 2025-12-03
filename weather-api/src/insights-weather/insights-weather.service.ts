import { Inject, Injectable } from '@nestjs/common';

import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { PrismaService } from 'database/prisma.service';
import Groq from 'groq-sdk/index.mjs';
@Injectable()
export class InsightsWeatherService {
  private readonly groq = new Groq({
    apiKey: process.env.WEATHERAI_API_KEY,
  });

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async generateInsights() {
    const cached = await this.cacheManager.get('insights-24h');
    if (cached) {
      console.log('Retornando insights do cache');
      return cached;
    }
    console.log('new insights');
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const samples = await this.prisma.weatherSample.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
    });

    if (!samples.length) {
      return { message: 'Sem dados suficientes para gerar insights.' };
    }

    const compact = samples.map((s) => ({
      timestamp: s.timestamp,
      temp: s.temperatureC,
      humidity: s.humidity,
      wind: s.windSpeedMs,
      dir: s.windDirection,
    }));

    const prompt = `
Você é um especialista em meteorologia e análise de séries temporais.
Com base nos dados das últimas 24h abaixo, gere insights objetivos:

DADOS:
${JSON.stringify(compact, null, 2)}

Responda em JSON no formato:
{
  "resumo": "breve resumo das últimas 24h",
  "tendencias": ["padrões detectados", "..."],
  "alertas": ["alertas relevantes", "..."],
  "previsao_qualitativa": "previsão de curto prazo baseada no padrão observado"
}
    `;

    const completion = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'Você gera insights climáticos.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content);
    await this.cacheManager.set('insights-24h', result, 24 * 60 * 60);

    return result;
  }
}
