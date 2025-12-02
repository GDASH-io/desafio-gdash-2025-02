import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { GoogleGenerativeAI } from '@google/generative-ai'

export interface WeatherInsight {
  summary: string
  details: Array<{
    type: 'trend' | 'warning' | 'alert' | 'recommendation'
    category: string
    message: string
  }>
  generated_at: string
  context?: any
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name)
  private genAI: GoogleGenerativeAI | null = null

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY')

    if (apiKey && apiKey !== 'your_key_here') {
      this.logger.log('🤖 Inicializando Gemini AI...')
      this.genAI = new GoogleGenerativeAI(apiKey)
      this.logger.log('✅ Gemini AI configurado com sucesso')
    } else {
      this.logger.warn(
        '⚠️ GEMINI_API_KEY não configurada. Insights de IA desabilitados.'
      )
    }
  }

  async generateInsights(weatherData: any[]): Promise<WeatherInsight | null> {
    if (!this.genAI) {
      this.logger.warn('IA não disponível. Retornando null para usar fallback.')
      return null
    }
    
    try {
      this.logger.log('🧠 Gerando insights com Gemini AI...')

      const dataForPrompt = weatherData.map(item => ({
        timestamp: item.timestamp,
        city: item.location?.city || 'Unknown',
        temperature: item.data?.temperature || 0,
        humidity: item.data?.humidity || 0,
        windSpeed: item.data?.windSpeed ?? item.data?.wind_speed ?? 0,
        description: item.data?.description || item.data?.weatherCondition || 'No description',
      }))

      const prompt = `Você é um assistente meteorológico especializado. Analise os seguintes dados meteorológicos das últimas 24 horas e gere insights em português do Brasil.

Dados meteorológicos (mais recentes primeiro):
${JSON.stringify(dataForPrompt.slice(0, 20), null, 2)}

Sua tarefa:

1. Identifique tendências (temperatura subindo/caindo, mudanças de umidade, etc.)
2. Detecte anomalias ou condições extremas
3. Forneça recomendações práticas se aplicável

Retorne APENAS um JSON válido no seguinte formato:
{
"summary": "Resumo geral em uma frase",
"details": [
{
"type": "trend",
"category": "temperature",
"message": "Descrição da tendência"
}
]
}

Tipos válidos: "trend", "warning", "alert", "recommendation"
Categorias válidas: "temperature", "humidity", "wind", "general"`

      this.logger.log('🔄 Usando modelo: gemini-2.0-flash')
      
      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 1024,
        }
      })
      
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      this.logger.log('📝 Resposta da IA recebida')

      let parsedResponse
      try {
        const cleanText = text
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim()
        parsedResponse = JSON.parse(cleanText)
      } catch (parseError) {
        this.logger.error('Erro ao fazer parse da resposta da IA:', parseError)
        this.logger.error('Texto recebido:', text)
        return null
      }

      return {
        ...parsedResponse,
        generated_at: new Date().toISOString(),
        context: {
          dataPointsAnalyzed: weatherData.length,
          aiProvider: 'gemini',
          model: 'gemini-2.0-flash',
        },
      }
    } catch (error: any) {
      this.logger.error('❌ Erro ao gerar insights com IA:', error.message)
      this.logger.error('Stack:', error.stack)
      return null
    }
  }
}