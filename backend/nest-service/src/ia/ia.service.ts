import { GroqService } from "@bytebitlabs/nest-groq";
import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { ResponseProps, type WeatherData } from "src/weather/weather.service";

const jsonSchema = {
  name: 'weather_suggestion',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      weatherAnalysis: { type: 'string' },
      concerningLevel: {
        type: 'number',
        minimum: 0,
        maximum: 1,
        description: "Nível de preocupação em %"
      },
      suggestedAction: { type: 'string' },
      radiationAnalysis: {
        type: 'string',
        description: "Análise do nível de radiação (MJ/m²) atual e durante os próximos dias"
      },
    },
    required: ['weatherAnalysis', 'suggestedAction', 'concerningLevel'],
    additionalProperties: false
  },
};

@Injectable()
export class IaService {
  private systemPrompt: string;
  constructor(
    private readonly groqService: GroqService
  ) {
    this.systemPrompt = `Você é um analisa de clima. Análise os dados meteorológicos em JSON e responda EXATAMENTE NO formato JSON definido pelo schema.

REGRAS OBRIGATÓRIAS:
- Responda SOMENTE com o JSON válido (nada antes, nada depois, nenhum "Aqui está", nenhum markdown).
- Coloque a análise curta e possíveis tendências de acordo a temperatura da ultima semana, atual e próximos dias em "weatherAnalysis" (máximo 40-70 palavras).
- Defina "concerningLevel" (relacionado a weatherAnalysis e indice de uv do dia atual) como número de 0 a 1 (ex: 0.1 = tranquilo, 0.9 = extremo).
- Em "suggestedAction" coloque uma sugestão prática (de acordo weatherAnalysis) e animadas (por exemplo: "Que tal uma corrida leve?", "Leve o guarda-chuva, vai pingar!", "Se hidrate!"").
- Em "radiationAnalysis" coloque a análise do nível de radição atual e dos próximos dias, aborde também sobre se é um bom momento para geração de energia solar
- Use tom leve, amigável, com ? e ! para animação, mas NUNCA emojis nem explicações longas.
- Nunca peça resposta do usuário.

Responda apenas o JSON puro.`
  }

  async getInsight(weatherData: WeatherData[]):Promise<ResponseProps> {
    try {
      const completion = await this.groqService.chat.completions.create({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "system",
            content: this.systemPrompt,
          },
          {
            role: 'user',
            content: JSON.stringify(weatherData)
          }
        ],
        temperature: 0.1,
        max_tokens: 512,
        response_format: {
          type: "json_schema",
          json_schema: jsonSchema
        }
      }
      );

      const insight = completion.choices[0].message?.content  || "";

      return {success: true, message: insight, STATUS_CODE: HttpStatus.OK}
    } catch(e) {
      Logger.error("Erro ao conseguir insights de IA");
      Logger.error(e)
      return {success: false, message: "Erro interno do servidor", STATUS_CODE: HttpStatus.INTERNAL_SERVER_ERROR}
    }
  }
}