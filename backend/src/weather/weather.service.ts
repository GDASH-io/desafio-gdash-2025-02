import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { 
  WeatherLog,
  WeatherLogDocument,
  WeatherInsightCache,
  WeatherInsightCacheDocument 
} from './weather.schema';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { AIService } from '../ai/ai.service';
import * as XLSX from 'xlsx';

@Injectable()
export class WeatherService {
  // ⏱️ Cache de insights: 30 minutos
  private readonly CACHE_DURATION_MINUTES = 30;

  constructor(
    @InjectModel(WeatherLog.name)
    private model: Model<WeatherLogDocument>,
    @InjectModel(WeatherInsightCache.name)
    private insightCacheModel: Model<WeatherInsightCacheDocument>,
    private aiService: AIService,
  ) {}

  async create(dto: CreateWeatherDto) {
    return this.model.create(dto);
  }

  async list() {
    return this.model.find().sort({ timestamp: -1 }).limit(200);
  }

  async exportCSV() {
    const data = await this.model.find().lean();
    const header = Object.keys(data[0] || {});
    const rows = data.map((row) => header.map((h) => row[h as keyof typeof row]));

    const csv = [
      header.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\n');

    return csv;
  }

  async exportXLSX() {
    const data = await this.model.find().lean();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'WeatherLogs');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async insights() {
    console.log('🔍 [Weather] Verificando cache de insights...');

    // 1️⃣ VERIFICAR CACHE VÁLIDO
    const cachedInsight = await this.insightCacheModel
      .findOne({ expiresAt: { $gt: new Date() } })
      .sort({ generatedAt: -1 });

    if (cachedInsight) {
      const minutosRestantes = Math.round(
        (cachedInsight.expiresAt.getTime() - Date.now()) / 1000 / 60
      );
      console.log(`✅ [Weather] Cache válido! Expira em ${minutosRestantes} minutos.`);
      
      return {
        ...cachedInsight.metadata,
        text: cachedInsight.insightText,
        cached: true,
        generatedAt: cachedInsight.generatedAt,
        expiresAt: cachedInsight.expiresAt,
      };
    }

    // 2️⃣ CACHE EXPIRADO - GERAR NOVO
    console.log('⏰ [Weather] Cache expirado! Gerando novos insights...');

    const last24h = await this.model.find({
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    if (!last24h.length) {
      return { text: 'Nenhum dado suficiente para gerar insights.' };
    }

    // ========== CÁLCULOS BÁSICOS ==========
    const avgTemp = this.avg(last24h.map((x) => x.temperature));
    const avgHum = this.avg(last24h.map((x) => x.humidity));
    const avgWind = this.avg(last24h.map((x) => x.wind_speed));
    const rainHighRatio =
  last24h.filter((x) => (x.rain_probability ?? 0) >= 70).length / last24h.length;


    const sorted = last24h.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );
    const first = sorted.slice(0, 3);
    const last = sorted.slice(-3);
    const tempTrend =
      this.avg(last.map((x) => x.temperature)) -
      this.avg(first.map((x) => x.temperature));

    let trendText = 'Estável';
    if (tempTrend > 1) trendText = 'Tendência de alta temperatura';
    if (tempTrend < -1) trendText = 'Tendência de queda de temperatura';

    const comfortScoreRaw =
      100 - Math.abs(avgTemp - 22) * 3 - Math.max(0, avgHum - 60) * 0.5;
    const comfortScore = Math.max(0, Math.min(100, comfortScoreRaw));

    let classification = 'agradável';
    if (avgTemp < 15) classification = 'frio';
    else if (avgTemp > 34) classification = 'muito quente';
    else if (avgTemp > 30) classification = 'quente';

    const alerts: string[] = [];
    if (rainHighRatio > 0.3)
      alerts.push('Alta chance de chuva nas próximas horas.');
    if (avgTemp > 32) alerts.push('Calor extremo.');
    if (avgTemp < 10) alerts.push('Frio intenso.');

    // ========== 🔥 GERAR INSIGHTS COM IA ==========
    const aiText = await this.aiService.generateWeatherInsights({
      avgTemp,
      avgHum,
      avgWind,
      trendText,
      classification,
      alerts,
      comfortScore: Math.round(comfortScore),
      totalRecords: last24h.length,
    });

    // ========== 💾 SALVAR CACHE POR 30 MINUTOS ==========
    const expiresAt = new Date(Date.now() + this.CACHE_DURATION_MINUTES * 60 * 1000);

    const newInsight = new this.insightCacheModel({
      insightText: aiText,
      metadata: {
        avgTemp,
        avgHum,
        avgWind,
        trendText,
        comfortScore: Math.round(comfortScore),
        classification,
        rainHighRatio,
        alerts,
      },
      generatedAt: new Date(),
      expiresAt,
    });

    await newInsight.save();

    console.log(`💾 [Weather] Insights salvos! Válidos até ${expiresAt.toLocaleString('pt-BR')}`);

    // ========== RETORNO COMPLETO ==========
    return {
      avgTemp,
      avgHum,
      avgWind,
      trendText,
      comfortScore: Math.round(comfortScore),
      classification,
      rainHighRatio,
      alerts,
      text: aiText,
      cached: false,
      generatedAt: new Date(),
      expiresAt,
    };
  }

  private avg(arr: number[]) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }
}
