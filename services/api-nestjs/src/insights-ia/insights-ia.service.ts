import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { logsWeatherDTO } from '../DTO/logsWeather.dto';
import { ChatResponseDto } from 'src/DTO/prompt.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { WeatherLogs } from 'src/schema/user.schema';
import { ConfigService } from '@nestjs/config';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';


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

    async generateInsights(): Promise<ChatResponseDto> {
        const logs = await this.weatherLogsModel.find().exec();
        const prompt = `
        Você receberá uma lista chamada logs, onde cada item contém:
            temperatura, umidade, vento, condicao, probabilidade_chuva, data_coleta, cidade.
        Lista: ${JSON.stringify(logs)}

            Tarefas:
            - Calcular estatísticas a partir dos logs:
                Médias: temperatura, umidade, vento, probabilidade_chuva.
                Máximos e mínimos (com timestamps): temperatura, umidade, vento.
            - Tendência da temperatura: “subindo”, “caindo” ou “estavel” (use regressão simples ou comparação entre metades).
            - Pontuação de conforto climático (0-100)
            - Penalize desvios de 22°C e 50% umidade, picos de vento e variações bruscas.
            Classificação do período:
            - chuvoso: probabilidade_chuva alta ou condição indicando chuva.
            - quente: média temp ≥ 28°C
            - frio: média temp ≤ 15°C
            - Senão, agradavel.
            - Alertas (somente os aplicáveis):
            - Alta chance de chuva (probabilidade média ≥ 60%)
            - Calor extremo (temp_max ≥ 38°C)
            - Frio intenso (temp_min ≤ 8°C)
            - Vento forte (vento_max ≥ 35)
            - Variação térmica acentuada (≥ 5°C)
            Gerar o JSON final chamado resultado com:
            "logs": [mesmos logs recebidos]
            "estatisticas": {...} com todas as métricas acima.

            Retorne primeiro somente o JSON, sem texto extra.

            Após o JSON, escreva uma análise técnica, objetiva e profissional como um especialista em meteorologia, interpretando os valores, classificações e alertas.`


        try {
            const sessionInUse = `session-${Date.now()}`;
            let insightSession = this.chatSessions.get(sessionInUse);
            if (!insightSession) {
                insightSession = this.genModel.startChat();
                this.chatSessions.set(sessionInUse, insightSession);
            }

            const message = await insightSession.sendMessage(prompt);
            const response: ChatResponseDto = {
                response: message.text,
                sessionId: sessionInUse,
            };
            return response;
        } catch (error) {
            this.logger.error('Erro ao gerar insights com Gemini IA', error);
            throw new Error('Falha ao gerar insights com Gemini IA');
        }
    }
    clearSession(sessionId: string): Boolean {
        return this.chatSessions.delete(sessionId);
    }
}