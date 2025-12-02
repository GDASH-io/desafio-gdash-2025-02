import { Controller, Get } from "@nestjs/common";
import { AiService } from "./ai.service";

@Controller("ai")
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /** Retorna um insight descritivo em linguagem natural */
  @Get("descriptive")
  async descriptive() {
    return await this.aiService.descriptiveInsight();
  }

  /** Retorna os dados brutos de clima (últimos registros) */
  @Get("insights")
  async insights() {
    return await this.aiService.getWeatherData();
  }

  /** Retorna insights estruturados em JSON */
  @Get("structured")
  async structured() {
    return await this.aiService.structuredInsight();
  }

  /** Previsão de curto prazo em JSON */
  @Get("forecast")
  async forecast() {
    return await this.aiService.shortTermForecast();
  }

  /** Resumo diário do clima em linguagem natural */
  @Get("summary")
  async summary() {
    return await this.aiService.dailySummary();
  }

  /** Análise histórica do clima em JSON */
  @Get("historical")
  async historical() {
    return await this.aiService.historicalAnalysis();
  }

  @Get("alerts")
  async alerts() {
    return await this.aiService.smartAlerts();
  }
}
