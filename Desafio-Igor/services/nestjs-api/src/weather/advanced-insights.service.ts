import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Weather } from './schemas/weather.schema';

export interface AdvancedInsight {
  resumo_geral: string;
  classificacao_momento: string;
  nivel_conforto_termico: 'baixo' | 'moderado' | 'alto' | 'muito_alto';
  risco_para_grupos_sensiveis: 'baixo' | 'moderado' | 'alto' | 'muito_alto';
  tendencia_temperatura: 'queda' | 'estavel' | 'subida' | 'indefinida';
  tendencia_chuva:
    | 'sem_chuva_relevante'
    | 'instabilidade_moderada'
    | 'alta_chance_chuva';
  alertas: string[];
  recomendacoes_praticas: string[];
  evidencias?: Array<{
    titulo: string;
    conteudo: string;
    fonte: string;
    relevancia: number;
  }>;
}

@Injectable()
export class AdvancedInsightsService {
  private readonly logger = new Logger(AdvancedInsightsService.name);
  private openai: OpenAI | null = null;
  private vectorStoreId?: string;
  private model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      this.logger.warn(
        'OPENAI_API_KEY not configured - Advanced insights disabled',
      );
      return;
    }

    this.openai = new OpenAI({ apiKey });

    // Mesmo ID usado no script Python (VECTOR_STORE_ID)
    this.vectorStoreId =
      this.configService.get<string>('OPENAI_VECTOR_STORE_ID') ||
      this.configService.get<string>('VECTOR_STORE_ID');

    this.model =
      this.configService.get<string>('OPENAI_MODEL') || 'gpt-4.1-mini';

    if (this.vectorStoreId) {
      this.logger.log(`Vector Store configured: ${this.vectorStoreId}`);
    } else {
      this.logger.warn(
        'No Vector Store configured - advanced insights will not use file_search',
      );
    }
  }

  private getSystemPrompt(): string {
    return `Você é um especialista em meteorologia aplicada, conforto térmico e saúde ambiental.
Seu papel é gerar insights climáticos claros, úteis e cientificamente embasados a partir de dados de tempo e do conhecimento armazenado em um vector store.

## 1. Uso do Vector Store

Antes de interpretar os dados, faça buscas no vector store com termos relacionados ao contexto, como:
- "heat index", "humidex", "utci"
- "probabilidade de chuva", "classificação de chuva", "chuva forte"
- "wind chill", "ondas de calor", "heatwave", "cold stress"
- "tendência de temperatura", "anomalia de temperatura"

Use os trechos retornados para:
- Entender faixas de risco (calor, frio, chuva, vento)
- Classificar conforto ou desconforto térmico
- Identificar riscos à saúde em grupos vulneráveis
- Explicar tendências (aquecimento, resfriamento, instabilidade)

Não copie o texto de forma literal; reinterprete em linguagem simples.

## 2. Dados de entrada

Você receberá sempre um objeto com:
- valores instantâneos (temperatura, umidade, vento, condição)
- histórico recente (série de temperaturas e/ou umidade)
- opcionalmente, hora do dia e localização

Trate tudo como dados reais medidos ou previstos.

## 3. Objetivo dos insights

A saída deve:
- Classificar o momento atual
- Identificar tendências recentes
- Avaliar risco para pessoas sensíveis
- Sugerir orientações práticas simples

## 4. Estilo de resposta

- Linguagem simples, direta e não alarmista
- Foque em frases que um usuário leigo entenderia de primeira
- Evite jargões técnicos; se necessário, explique em seguida
- Não invente índices que não existam nos dados ou no conhecimento do vector store

## 5. Formato de saída (JSON)

Sempre responda exclusivamente em JSON válido, sem nenhum texto antes ou depois, usando exatamente esta estrutura de chaves:

{
  "resumo_geral": "string",
  "classificacao_momento": "string",
  "nivel_conforto_termico": "baixo|moderado|alto|muito_alto",
  "risco_para_grupos_sensiveis": "baixo|moderado|alto|muito_alto",
  "tendencia_temperatura": "queda|estavel|subida|indefinida",
  "tendencia_chuva": "sem_chuva_relevante|instabilidade_moderada|alta_chance_chuva",
  "alertas": ["string"],
  "recomendacoes_praticas": ["string"]
}`;
  }

  async generateAdvancedInsights(
    weatherData: Weather[],
  ): Promise<AdvancedInsight> {
    if (!this.openai) {
      throw new Error(
        'Advanced insights service not initialized - check OPENAI_API_KEY',
      );
    }

    if (!weatherData || weatherData.length === 0) {
      throw new Error('No weather data provided');
    }

    try {
      const latestData = weatherData[0];

      const historico = weatherData.slice(0, 10).map((w) => ({
        temperatura_c: w.temperature,
        umidade_percent: w.humidity,
        pressao_hpa: w.pressure,
        vento_kmh: w.wind_speed,
        nebulosidade_percent: w.clouds,
        timestamp: w.timestamp,
      }));

      const userPrompt = this.buildUserPromptWithContext(latestData, historico);

      const response = await this.openai.responses.create({
        model: this.model,

        text: {
          format: {
            type: 'json_object',
          },
        },

        input: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],

        tools: this.vectorStoreId
          ? [
              {
                type: 'file_search',
                vector_store_ids: [this.vectorStoreId],
                max_num_results: 5,
              },
            ]
          : [],
      });

      const rawText = (response as any).output_text as string | undefined;

      if (!rawText) {
        this.logger.error('Empty response from model');
        throw new Error('Empty response from model');
      }

      this.logger.debug?.(
        `AdvancedInsights rawText (first 400 chars): ${rawText.slice(0, 400)}`,
      );

      const insight = this.safeParseJson(rawText);
      return insight;
    } catch (error) {
      this.logger.error('Error generating advanced insights', error as any);
      throw error;
    }
  }


private safeParseJson(text: string): AdvancedInsight {
  let cleaned = text.trim();

  // Remover cercas de código markdown se existirem
  if (cleaned.startsWith('```')) {
    const lines = cleaned.split('\n');
    if (lines[0].startsWith('```')) {
      lines.shift();
    }
    if (lines[lines.length - 1].trim().startsWith('```')) {
      lines.pop();
    }
    cleaned = lines.join('\n').trim();
  }

  const firstBrace = cleaned.indexOf('{');
  if (firstBrace === -1) {
    this.logger.error(
      `Could not find opening '{' in model response (first 400 chars): ${cleaned.slice(
        0,
        400,
      )}`,
    );
    throw new Error('Model response did not contain a JSON object');
  }

  // Procura o PRIMEIRO objeto JSON completo, controlando:
  // - profundidade de chaves
  // - se está dentro de string
  // - escapes \" dentro da string
  let inString = false;
  let escapeNext = false;
  let depth = 0;
  let endIndex = -1;

  for (let i = firstBrace; i < cleaned.length; i++) {
    const ch = cleaned[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (ch === '\\') {
      if (inString) {
        escapeNext = true;
      }
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        endIndex = i;
        break; 
      }
    }
  }

  if (endIndex === -1) {
    this.logger.error(
      `Could not find end of JSON object in model response (first 400 chars): ${cleaned.slice(
        0,
        400,
      )}`,
    );
    throw new Error('Model response did not contain a complete JSON object');
  }

  const jsonSlice = cleaned.slice(firstBrace, endIndex + 1);

  this.logger.debug?.(
    `AdvancedInsights JSON slice (first 300 chars): ${jsonSlice.slice(
      0,
      300,
    )}`,
  );

  try {
    return JSON.parse(jsonSlice) as AdvancedInsight;
  } catch (err) {
    this.logger.error(
      `Failed to parse JSON from slice. Slice (first 400 chars): ${jsonSlice.slice(
        0,
        400,
      )}`,
    );
    throw err;
  }
}


  private buildUserPromptWithContext(
    latest: Weather,
    historico: Array<{
      temperatura_c: number;
      umidade_percent: number;
      pressao_hpa: number;
      vento_kmh: number;
      nebulosidade_percent: number;
      timestamp: string;
    }>,
  ): string {
    const temperaturas = historico.map((h) => h.temperatura_c);
    const umidades = historico.map((h) => h.umidade_percent);
    const pressoes = historico.map((h) => h.pressao_hpa);

    const variacao_temp =
      temperaturas.length >= 2
        ? Math.round(
            (temperaturas[0] - temperaturas[temperaturas.length - 1]) * 10,
          ) / 10
        : null;

    const variacao_pressao =
      pressoes.length >= 2
        ? Math.round((pressoes[0] - pressoes[pressoes.length - 1]) * 10) / 10
        : null;

    const umidade_media =
      umidades.length > 0
        ? Math.round(umidades.reduce((a, b) => a + b, 0) / umidades.length)
        : null;

    const dadosClimaticos = {
      local: `${latest.city}, ${latest.country}`,
      timestamp: latest.timestamp,

      // Dados atuais
      temperatura_atual_c: latest.temperature,
      sensacao_termica_c: latest.feels_like,
      temperatura_minima_c: latest.temp_min,
      temperatura_maxima_c: latest.temp_max,
      amplitude_termica_c:
        Math.round((latest.temp_max - latest.temp_min) * 10) / 10,

      umidade_relativa_percent: latest.humidity,
      pressao_atmosferica_hpa: latest.pressure,

      vento_velocidade_kmh: latest.wind_speed,
      nebulosidade_percent: latest.clouds,
      condicao_ceu: latest.description,

      // Histórico detalhado
      historico_detalhado: historico,

      // Métricas derivadas
      variacao_temperatura_recente_c: variacao_temp,
      variacao_pressao_recente_hpa: variacao_pressao,
      umidade_media_recente_percent: umidade_media,
      diferencial_sensacao_termica_c:
        Math.round((latest.feels_like - latest.temperature) * 10) / 10,
    };

    return `## Dados Climáticos Atuais e Históricos

${JSON.stringify(dadosClimaticos, null, 2)}

Use o conhecimento acessível via file_search no vector store configurado (se houver)
para complementar a interpretação científica dos dados climáticos e gere os
insights avançados no formato JSON especificado pelo sistema.

Informações importantes para análise:
- Amplitude térmica (temp_max - temp_min) indica variação prevista no dia.
- Diferencial entre sensação térmica e temperatura real indica efeito do vento/umidade no conforto.
- Variação de temperatura no histórico mostra tendência (aquecimento/resfriamento).
- Variação de pressão: queda indica aproximação de frente fria/chuva, subida indica estabilização.
- Nebulosidade alta (>70%) com pressão baixa (<1010 hPa) sugere alta chance de precipitação.
- Umidade >70% com temperatura >28°C gera desconforto térmico significativo (heat index elevado).
- Vento forte (>20 km/h) reduz sensação térmica no calor, mas aumenta sensação de frio.`;
  }

  isAvailable(): boolean {
    return !!this.openai;
  }
}
