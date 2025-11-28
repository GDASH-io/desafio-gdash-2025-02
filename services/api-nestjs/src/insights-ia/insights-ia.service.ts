import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { logsWeatherDTO } from '../DTO/logsWeather.dto';
import { ChatResponseDto } from 'src/DTO/prompt.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { WeatherLogs } from 'src/schema/weather.schema';
import { ConfigService } from '@nestjs/config';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { json } from 'stream/consumers';


@Injectable()
export class InsightsIaService implements OnModuleInit {
    private genModel: GenerativeModel;
    private chatSessions: Map<string, any> = new Map();
    private readonly logger = new Logger(InsightsIaService.name);


    constructor(
        @InjectModel('WeatherLogs')
        private weatherLogsModel: Model<WeatherLogs>,
        private configService: ConfigService,
    ) { }

    onModuleInit() {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            this.logger.error('GEMINI_API_KEY não está definido na configuração');
            throw new Error('Falha na inicialização do Gemini');
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        this.genModel = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
        });
    }

    cleanedResponse(responseText: string): { json: any; analysis: string } {
        const jsonMatch = responseText.match(/<JSON>([\s\S]*?)<\/JSON>/);
        const analysisMatch = responseText.match(/<ANALISE>([\s\S]*?)<\/ANALISE>/);

        if (!jsonMatch) {
            throw new Error("JSON não encontrado na resposta do modelo.");
        }

        const jsonStr = jsonMatch[1].trim();
        const analysis = analysisMatch ? analysisMatch[1].trim() : "";

        try {
            return {
                json: JSON.parse(jsonStr),
                analysis,
            };
        } catch (err) {
            this.logger.error("Falha ao parsear JSON: " + err);
            throw new Error("JSON inválido na resposta do modelo.");
        }
    }


    async generateInsights(): Promise<ChatResponseDto> {
        const logs = await this.weatherLogsModel.find().exec();
        const prompt = `
        Você é um analista climático especializado em dados históricos e padrões meteorológicos.

Siga estritamente o formato abaixo. Não adicione nada fora dos blocos. Não reordene. Não explique. Não escreva texto solto.

FORMATO DE RESPOSTA:

<JSON>
{ ...json válido, sem comentários, sem blocos extras... }
</JSON>

<ANALISE>
texto técnico da análise
</ANALISE>

INSTRUÇÕES DO JSON:

O JSON deve conter exatamente:

{
  "estatisticas": {
    "temperatura": { "media": number, "max": number, "min": number },
    "umidade": { "media": number, "max": number, "min": number },
    "vento": { "media": number, "max": number, "min": number },
    "probabilidade_chuva": { "media": number, "max": number, "min": number }
  },
  "conforto_climatico": number,
  "resumo": string
}

Regras:
- Todos os números devem ser valores numéricos reais.
- "conforto_climatico" deve ser um valor de 0 a 100. Calculado da seguinte forma: 0,6 * Temperatura +0,4 * Umidade. Onde Temperatura e Umidade são as médias calculadas.
- O campo "resumo" deve ser direto, conciso e obrigatório.

INSTRUÇÕES DA ANÁLISE:
No bloco <ANALISE> faça uma análise técnica de qualidade, cobrindo:
- tendência geral
- anomalias
- padrões
- interpretação prática dos dados
- riscos e implicações
DADOS:
Cidade: Teresina, PI
Registros (JSON): ${JSON.stringify(logs)}
        `;

        try {
            const result = await this.genModel.generateContent(prompt);
            const response = await result.response;
            const responseText = await response.text();
            const cleanedResponse = this.cleanedResponse(responseText);

            return {
                estatisticas: cleanedResponse.json.estatisticas,
                conforto_climatico: cleanedResponse.json.conforto_climatico,
                resumo: cleanedResponse.json.resumo,
                analise_tecnica: cleanedResponse.analysis,
            }

        } catch (error) {
            this.logger.error('Erro ao gerar insights com Gemini IA', error);
            throw new Error('Falha ao gerar insights com Gemini IA');
        }
    }
}