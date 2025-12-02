import { Injectable, Logger } from "@nestjs/common";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { WeatherService } from "../weather/weather.service";

interface CacheEntry {
  data: any;
  timestamp: number;
}

@Injectable()
export class AiService {
  private readonly apiKey: string;
  private readonly client;
  private readonly model;
  private readonly cache = new Map<string, CacheEntry>();
  private readonly logger = new Logger(AiService.name);
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  constructor(private weatherService: WeatherService) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY não definida!");
    }

    this.apiKey = process.env.GEMINI_API_KEY;
    this.client = new GoogleGenerativeAI(this.apiKey);
    this.model = this.client.getGenerativeModel({
      model: "gemini-2.0-flash",
    });
  }

  private async cachedAsk(key: string, promptFn: () => Promise<string>): Promise<string> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.logger.debug(`Cache hit: ${key}`);
      return cached.data;
    }

    let retries = 3;
    let delay = 5000;

    while (retries > 0) {
      try {
        const prompt = await promptFn();
        const result = await this.model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        const text = result.response.text();
        this.cache.set(key, { data: text, timestamp: Date.now() });
        return text;
      } catch (err: any) {
        this.logger.warn(`Erro AI: ${err.message}. Tentando novamente em ${delay / 1000}s`);
        if (err?.code === 429) {
          await new Promise((r) => setTimeout(r, delay));
          delay *= 2; // backoff exponencial
        } else {
          throw err;
        }
        retries--;
      }
    }

    throw new Error("Falha ao obter resposta da AI após múltiplas tentativas.");
  }

  private extractJson(text: string) {
    try {
      let cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      return match ? JSON.parse(match[0]) : JSON.parse(cleaned);
    } catch (err) {
      this.logger.error("JSON inválido vindo do Gemini:", text);
      throw new Error("Resposta inválida do modelo AI");
    }
  }

  async getWeatherData() {
    return await this.weatherService.findLatest(50);
  }

  // === INSIGHTS ===
  async descriptiveInsight() {
    return await this.cachedAsk("descriptiveInsight", async () => {
      const data = await this.getWeatherData();
      return `Gere um insight descritivo sobre os dados climáticos.
        Resuma tendências sem usar números exatos.
        Dados: ${JSON.stringify(data, null, 2)}`;
    });
  }

  async structuredInsight() {
    return await this.cachedAsk("structuredInsight", async () => {
      const data = await this.getWeatherData();
      return `Analise os dados e retorne SOMENTE JSON:
      {
        "tendencia": "...",
        "perigo": "...",
        "recomendacao": "..."
      }
      Dados: ${JSON.stringify(data, null, 2)}`;
    }).then(this.extractJson);
  }

  async shortTermForecast() {
    return await this.cachedAsk("shortTermForecast", async () => {
      const data = await this.getWeatherData();
      return `Com base na tendência dos dados, retorne SOMENTE JSON:
      {
        "previsao": "...",
        "chance_chuva": "alta | moderada | baixa",
        "temperatura_prevista": "alta | estável | caindo"
      }
      Dados: ${JSON.stringify(data, null, 2)}`;
    }).then(this.extractJson);
  }

  async dailySummary() {
    return await this.cachedAsk("dailySummary", async () => {
      const data = await this.getWeatherData();
      return `Resuma como estaria o "Clima do Dia". Fale de forma natural. NÃO retorne JSON.
        Dados: ${JSON.stringify(data, null, 2)}`;
    });
  }

  async historicalAnalysis() {
    return await this.cachedAsk("historicalAnalysis", async () => {
      const data = await this.getWeatherData();
      return `Analise médias e retorne SOMENTE JSON:
      {
        "media_temperatura": "...",
        "media_umidade": "...",
        "media_vento": "...",
        "observacao": "..."
      }
      Dados: ${JSON.stringify(data, null, 2)}`;
    }).then(this.extractJson);
  }

  async smartAlerts() {
    return await this.cachedAsk("smartAlerts", async () => {
      const data = await this.getWeatherData();
      return `Gere alertas inteligentes. Retorne SOMENTE JSON:
      {
        "alertas": [
          "Alerta 1",
          "Alerta 2",
          "Alerta 3"
        ]
      }
      Dados: ${JSON.stringify(data, null, 2)}`;
    }).then(this.extractJson);
  }
}
