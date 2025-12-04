import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { FullWeatherData } from './ai.service';

interface CacheEntry {
  data: any;
  timestamp: number;
}

@Injectable()
export class GroqService {
  private readonly apiKey: string | null;
  private readonly baseUrl = 'https://api.groq.com/openai/v1';
  private readonly model = 'llama-3.3-70b-versatile';
  
  private readonly cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 10 * 60 * 1000;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('GROQ_API_KEY');
    setInterval(() => this.cleanExpiredCache(), 5 * 60 * 1000);
  }

  private getCacheKey(method: string, params: any): string {
    return `${method}_${JSON.stringify(params)}`;
  }

  private getFromCache(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }

  private async callGroqAPI(messages: Array<{ role: string; content: string }>, maxTokens: number = 800, temperature: number = 0.8): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY não configurada');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/chat/completions`,
          {
            model: this.model,
            messages,
            max_tokens: maxTokens,
            temperature,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        )
      );

      const content = response.data?.choices?.[0]?.message?.content || '';
      console.log('✅ [Groq] IA gerando conteúdo com sucesso');
      return content;
    } catch (error: any) {
      console.error('❌ [Groq] Erro na API:', error.response?.data || error.message);
      throw error;
    }
  }

  async generateDaySummary(weatherData: FullWeatherData, cityName: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY não configurada');
    }

    const cacheKey = this.getCacheKey('daySummary', { cityName, temperature: weatherData.temperature, weathercode: weatherData.weathercode });
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const weatherDescription = this.getWeatherDescription(weatherData.weathercode);
      
      const messages = [
        {
          role: 'system',
          content: 'Você é um assistente meteorológico experiente, detalhado e amigável. Sempre forneça análises específicas e úteis sobre o clima. Seja conciso e direto.',
        },
        {
          role: 'user',
          content: `Crie um resumo climático detalhado para ${cityName} baseado nas seguintes condições:

Temperatura: ${weatherData.temperature}°C
Sensação térmica: ${weatherData.apparent_temperature}°C
Umidade: ${weatherData.humidity}%
Velocidade do vento: ${weatherData.wind_speed} km/h
Probabilidade de chuva: ${weatherData.precipitation_probability || weatherData.rain}%
Índice UV: ${weatherData.uv_index || 'N/A'}
Condição do tempo: ${weatherDescription}

IMPORTANTE: Crie APENAS um resumo com:
1. Um título: "**Resumo Climático Detalhado para ${cityName}**"
2. Um parágrafo inicial com os dados climáticos principais
3. Uma seção "**Descrição do Clima**" com uma descrição VIVIDA e DETALHADA de como será a experiência de estar em ${cityName} hoje (2-3 parágrafos)

NÃO inclua:
- Alertas de saúde
- Sugestões de atividades
- Recomendações de vestuário

Seja ESPECÍFICO sobre ${cityName} e o clima atual. Use no máximo 300 palavras no total.`,
        },
      ];

      const content = await this.callGroqAPI(messages, 400, 0.8);
      const result = content || this.getFallbackDaySummary(weatherData, cityName);
      
      const finalResult = typeof result === 'string' ? result.trim() : String(result);
      
      console.log('✅ [Groq] Resumo do dia gerado');
      this.setCache(cacheKey, finalResult);
      return finalResult;
    } catch (error: any) {
      if (error?.response?.status === 429) {
        console.warn('⚠️ [Groq] Quota excedida. Usando fallback estático.');
        throw error;
      }
      console.error('❌ [Groq] Erro ao gerar resumo do dia:', error?.message || error);
      throw error;
    }
  }

  async generateMoodInsights(weatherData: FullWeatherData, cityName: string): Promise<string> {
    if (!this.apiKey) {
      return this.getFallbackMoodInsights(weatherData);
    }

    const cacheKey = this.getCacheKey('moodInsights', { cityName, temperature: weatherData.temperature, weathercode: weatherData.weathercode });
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const weatherDescription = this.getWeatherDescription(weatherData.weathercode);
      
      const messages = [
        {
          role: 'system',
          content: 'Você é um psicólogo experiente especializado em como condições climáticas afetam o humor. Seja conciso, organizado e direto ao ponto.',
        },
        {
          role: 'user',
          content: `Analise como o clima de ${cityName} HOJE afeta o humor e bem-estar:

Temperatura: ${weatherData.temperature}°C
Sensação térmica: ${weatherData.apparent_temperature}°C
Condição: ${weatherDescription}
Umidade: ${weatherData.humidity}%
Probabilidade de chuva: ${weatherData.precipitation_probability || weatherData.rain}%
Velocidade do vento: ${weatherData.wind_speed} km/h

IMPORTANTE: Crie uma análise CONCISA e ORGANIZADA (máximo 150 palavras) em 2-3 parágrafos:

1. Primeiro parágrafo: Como essas condições específicas afetam o humor (seja direto e específico)
2. Segundo parágrafo: Impactos emocionais principais (tristeza, alegria, relaxamento, ansiedade, etc.)
3. Terceiro parágrafo (opcional): Uma dica prática breve para manter o bem-estar

Seja DIRETO e ESPECÍFICO. Evite repetições e textos longos. Foque no essencial.`,
        },
      ];

      const content = await this.callGroqAPI(messages, 250, 0.7);
      const result = content || this.getFallbackMoodInsights(weatherData);
      
      const finalResult = typeof result === 'string' ? result.trim() : String(result);
      
      console.log('✅ [Groq] Insights de humor gerados');
      this.setCache(cacheKey, finalResult);
      return finalResult;
    } catch (error: any) {
      if (error?.response?.status === 429) {
        console.warn('⚠️ [Groq] Quota excedida. Usando fallback estático.');
        throw error;
      }
      console.error('❌ [Groq] Erro ao gerar insights de humor:', error?.message || error);
      throw error;
    }
  }

  async generateSmartAlerts(weatherData: FullWeatherData, cityName: string): Promise<string[]> {
    if (!this.apiKey) {
      return this.getFallbackSmartAlerts(weatherData);
    }

    const cacheKey = this.getCacheKey('smartAlerts', { cityName, temperature: weatherData.temperature, weathercode: weatherData.weathercode });
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const weatherDescription = this.getWeatherDescription(weatherData.weathercode);
      
      const messages = [
        {
          role: 'system',
          content: 'Você é um assistente meteorológico experiente que gera alertas inteligentes, específicos, detalhados e úteis sobre o clima. Sempre forneça alertas práticos e informativos.',
        },
        {
          role: 'user',
          content: `Você é um assistente meteorológico experiente que gera alertas inteligentes, específicos e úteis.

Analise as condições climáticas de ${cityName} HOJE e gere alertas inteligentes:

Temperatura: ${weatherData.temperature}°C
Sensação térmica: ${weatherData.apparent_temperature}°C
Umidade: ${weatherData.humidity}%
Velocidade do vento: ${weatherData.wind_speed} km/h
Probabilidade de chuva: ${weatherData.precipitation_probability || weatherData.rain}%
Índice UV: ${weatherData.uv_index || 'N/A'}
Condição: ${weatherDescription}

IMPORTANTE: Gere 3-5 alertas ESPECÍFICOS, DETALHADOS e VARIADOS para ${cityName}. Cada alerta deve:

1. Ser específico sobre a condição climática
2. Explicar o impacto prático
3. Fornecer uma recomendação clara
4. Ser diferente dos outros alertas

Formate como uma lista. Seja criativo e não repita os mesmos alertas sempre. Foque em alertas úteis e práticos.`,
        },
      ];

      const content = await this.callGroqAPI(messages, 400, 0.8);
      const alerts = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && (line.startsWith('-') || line.startsWith('•') || /^\d+\./.test(line)))
        .map(line => line.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '').trim())
        .filter(line => line.length > 15)
        .slice(0, 5);

      const result = alerts.length > 0 ? alerts : this.getFallbackSmartAlerts(weatherData);
      
      const finalResult = Array.isArray(result) ? result : [];
      
      console.log('✅ [Groq] Alertas inteligentes gerados');
      this.setCache(cacheKey, finalResult);
      return finalResult;
    } catch (error: any) {
      if (error?.response?.status === 429) {
        console.warn('⚠️ [Groq] Quota excedida. Usando fallback estático.');
        throw error;
      }
      console.error('❌ [Groq] Erro ao gerar alertas inteligentes:', error?.message || error);
      throw error;
    }
  }

  async generateActivityRecommendations(weatherData: FullWeatherData, cityName: string): Promise<string[]> {
    if (!this.apiKey) {
      return this.getFallbackActivityRecommendations(weatherData);
    }

    const cacheKey = this.getCacheKey('activityRecommendations', { cityName, temperature: weatherData.temperature, weathercode: weatherData.weathercode });
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const weatherDescription = this.getWeatherDescription(weatherData.weathercode);
      const cityInfo = this.getCityRegionInfo(cityName);
      
      const messages = [
        {
          role: 'system',
          content: 'Você é um especialista em recomendar atividades específicas, detalhadas e práticas baseadas no clima e localização. Sempre forneça sugestões concretas e detalhadas, nunca genéricas.',
        },
        {
          role: 'user',
          content: `Você é um especialista em recomendar atividades baseadas no clima, localização e CULTURA LOCAL.

Baseado no clima de ${cityName} HOJE:
- Temperatura: ${weatherData.temperature}°C
- Sensação térmica: ${weatherData.apparent_temperature}°C
- Condição: ${weatherDescription}
- Probabilidade de chuva: ${weatherData.precipitation_probability || weatherData.rain}%
- Umidade: ${weatherData.humidity}%
- Velocidade do vento: ${weatherData.wind_speed} km/h
- Região/País: ${cityInfo.region}, ${cityInfo.country}

IMPORTANTE: Sugira EXATAMENTE 7 atividades ESPECÍFICAS e COMPATÍVEIS com a REGIÃO de ${cityName}.

CRÍTICO: Considere a CULTURA e DISPONIBILIDADE da região:
- ${cityInfo.country === 'Brazil' ? 'No Brasil, especialmente em cidades costeiras como Salvador, NÃO sugira atividades como "sauna natural" ou "banhos termais" que não são comuns na região' : `Em ${cityInfo.country}, considere atividades típicas e disponíveis na região`}
- Sugira atividades REALMENTE DISPONÍVEIS em ${cityName} (ex: se for cidade costeira, mencione praias; se for cidade grande, mencione museus, parques urbanos, etc.)
- Considere a INFRAESTRUTURA da cidade (ex: Salvador tem praias, mas não tem estações de esqui)
- Seja ESPECÍFICO sobre locais e atividades reais da região

Para cada atividade, forneça:
- Nome da atividade ESPECÍFICA e REAL
- Uma descrição breve de por que é adequada para o clima atual

Formate como uma lista numerada (1. 2. 3. etc.) ou com marcadores (- ou •). Seja ESPECÍFICO e REALISTA. Gere EXATAMENTE 6 atividades completas.`,
        },
      ];

      const content = await this.callGroqAPI(messages, 700, 0.9);
      const lines = content.split(/\n+/).map(line => line.trim()).filter(line => line.length > 0);
      
      let activities: string[] = [];
      
      const numberedActivities = lines
        .filter(line => /^[\d]+[\.\)]\s+/.test(line))
        .map(line => line.replace(/^[\d]+[\.\)]\s+/, '').trim())
        .filter(line => line.length > 10);
      
      if (numberedActivities.length >= 6) {
        activities = numberedActivities.slice(0, 6);
      } else {
        const bulletedActivities = lines
          .filter(line => /^[-•*]\s+/.test(line))
          .map(line => line.replace(/^[-•*]\s+/, '').trim())
          .filter(line => line.length > 10);
        
        if (bulletedActivities.length >= 6) {
          activities = bulletedActivities.slice(0, 6);
        } else {
          const combined = [...numberedActivities, ...bulletedActivities]
            .filter((value, index, self) => self.indexOf(value) === index)
            .filter(line => line.length > 10);
          
          if (combined.length >= 6) {
            activities = combined.slice(0, 6);
          } else {
            const capitalizedActivities = lines
              .filter(line => /^[A-Z]/.test(line) && line.length > 30)
              .map(line => {
                return line.replace(/^(Aqui estão|Lista de|Atividades:|•|-\s*|\d+[\.\)]\s*)/i, '').trim();
              })
              .filter(line => line.length > 10);
            
            activities = [...combined, ...capitalizedActivities]
              .filter((value, index, self) => self.indexOf(value) === index)
              .slice(0, 6);
          }
        }
      }
      
      if (activities.length < 6) {
        const remainingLines = lines
          .filter(line => line.length > 30 && !activities.includes(line))
          .map(line => line.replace(/^(Aqui estão|Lista de|Atividades:|•|-\s*|\d+[\.\)]\s*)/i, '').trim())
          .filter(line => line.length > 10);
        
        activities = [...activities, ...remainingLines]
          .filter((value, index, self) => self.indexOf(value) === index)
          .slice(0, 6);
      }

      let finalResult: string[] = [];
      if (activities.length >= 6) {
        finalResult = activities.slice(0, 6);
      } else if (activities.length > 0) {
        const fallback = this.getFallbackActivityRecommendations(weatherData);
        const combined = [...activities, ...fallback]
          .filter((value, index, self) => self.indexOf(value) === index);
        finalResult = combined.slice(0, 6);
      } else {
        finalResult = this.getFallbackActivityRecommendations(weatherData);
      }
      
      if (finalResult.length < 6) {
        const fallback = this.getFallbackActivityRecommendations(weatherData);
        const needed = 6 - finalResult.length;
        const additional = fallback
          .filter(item => !finalResult.includes(item))
          .slice(0, needed);
        finalResult = [...finalResult, ...additional];
      }
      
      finalResult = finalResult.slice(0, 6);
      
      console.log('✅ [Groq] Recomendações de atividades geradas');
      this.setCache(cacheKey, finalResult);
      return finalResult;
    } catch (error: any) {
      if (error?.response?.status === 429) {
        console.warn('⚠️ [Groq] Quota excedida. Usando fallback estático.');
        throw error;
      }
      console.error('❌ [Groq] Erro ao gerar recomendações de atividades:', error?.message || error);
      throw error;
    }
  }

  async generateMovieCriteria(weatherData: FullWeatherData, cityName?: string): Promise<any> {
    if (!this.apiKey) {
      return this.getFallbackMovieCriteria(weatherData);
    }

    const cacheKey = this.getCacheKey('movieCriteria', { cityName, temperature: weatherData.temperature, weathercode: weatherData.weathercode });
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const weatherDescription = this.getWeatherDescription(weatherData.weathercode);
      
      const messages = [
        {
          role: 'system',
          content: 'Você é um especialista em recomendar filmes baseado em condições climáticas. Sempre retorne APENAS JSON válido com critérios para buscar filmes no TMDB. Nunca liste filmes específicos.',
        },
        {
          role: 'user',
          content: `Você é um especialista em recomendar filmes baseado em condições climáticas.

Analise as condições climáticas${cityName ? ` de ${cityName}` : ''} HOJE e gere critérios inteligentes para buscar filmes:

Temperatura: ${weatherData.temperature}°C
Sensação térmica: ${weatherData.apparent_temperature}°C
Condição: ${weatherDescription}
Umidade: ${weatherData.humidity}%
Velocidade do vento: ${weatherData.wind_speed} km/h
Probabilidade de chuva: ${weatherData.precipitation_probability || weatherData.rain}%
Índice UV: ${weatherData.uv_index || 'N/A'}

IMPORTANTE: Você NÃO deve buscar filmes. Você deve gerar CRITÉRIOS em formato JSON válido:

{
  "tema": "descrição do tema/humor (ex: 'relaxante, introspectivo', 'animado, energético')",
  "generos_sugeridos": ["lista", "de", "gêneros", "do", "TMDB", "em", "português", "ou", "inglês"],
  "tons": ["lista", "de", "tons", "ex: calmo, neutro, intenso"],
  "popularidade_minima": número de 0 a 100 (opcional, padrão 50),
  "vote_average_min": número de 0 a 10 (opcional, padrão 6.0),
  "year_range": {
    "min": ano mínimo (opcional, padrão últimos 15 anos),
    "max": ano máximo (opcional, padrão ano atual)
  },
  "description": "descrição curta do perfil de clima"
}

Gêneros válidos do TMDB (use nomes em português ou inglês): Ação, Aventura, Animação, Comédia, Crime, Documentário, Drama, Família, Fantasia, História, Terror, Música, Mistério, Romance, Ficção Científica, TV Movie, Thriller, Guerra, Western.

Seja ESPECÍFICO e baseado nas condições climáticas. Retorne APENAS o JSON, sem texto adicional.`,
        },
      ];

      const content = await this.callGroqAPI(messages, 400, 0.8);
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonContent = jsonMatch ? jsonMatch[0] : content;
        const criteria = JSON.parse(jsonContent);
        
        console.log('✅ [Groq] Critérios de filmes gerados');
        return {
          tema: criteria.tema || 'variado',
          generos_sugeridos: Array.isArray(criteria.generos_sugeridos) ? criteria.generos_sugeridos : [],
          tons: Array.isArray(criteria.tons) ? criteria.tons : ['neutro'],
          popularidade_minima: criteria.popularidade_minima || 50,
          vote_average_min: criteria.vote_average_min || 6.0,
          year_range: {
            min: criteria.year_range?.min || new Date().getFullYear() - 15,
            max: criteria.year_range?.max || new Date().getFullYear(),
          },
          description: criteria.description || 'Recomendações baseadas no clima atual',
        };
      } catch (parseError) {
        console.error('Erro ao parsear critérios de filmes:', parseError);
        return this.getFallbackMovieCriteria(weatherData);
      }
    } catch (error: any) {
      if (error?.response?.status === 429) {
        console.warn('⚠️ [Groq] Quota excedida. Usando fallback estático.');
        throw error;
      }
      console.error('❌ [Groq] Erro ao gerar critérios de filmes:', error?.message || error);
      throw error;
    }
  }

  async generateHealthAndWellnessConditions(weatherData: FullWeatherData, cityName: string): Promise<string[]> {
    if (!this.apiKey) {
      return this.getFallbackHealthConditions(weatherData);
    }

    const cacheKey = this.getCacheKey('healthConditions', { cityName, temperature: weatherData.temperature, weathercode: weatherData.weathercode });
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const weatherDescription = this.getWeatherDescription(weatherData.weathercode);
      
      const messages = [
        {
          role: 'system',
          content: 'Você é um médico especialista em saúde pública e medicina preventiva relacionada ao clima. Sempre forneça informações detalhadas, específicas e baseadas em evidências sobre como condições climáticas afetam a saúde, doenças relacionadas e medidas preventivas.',
        },
        {
          role: 'user',
          content: `Você é um médico especialista em saúde pública e medicina preventiva relacionada ao clima.

Analise as condições climáticas de ${cityName} HOJE e forneça informações DETALHADAS sobre saúde e prevenção:

Temperatura: ${weatherData.temperature}°C
Sensação térmica: ${weatherData.apparent_temperature}°C
Condição: ${weatherDescription}
Umidade: ${weatherData.humidity}%
Velocidade do vento: ${weatherData.wind_speed} km/h
Probabilidade de chuva: ${weatherData.precipitation_probability || weatherData.rain}%
Índice UV: ${weatherData.uv_index || 'N/A'}

IMPORTANTE: Responda ESPECIFICAMENTE estas 4 questões em formato de lista (4-6 itens no total):

1. QUAIS DOENÇAS são favorecidas por esse clima? (ex: gripes, resfriados, alergias respiratórias, desidratação, insolação, problemas cardiovasculares, etc.)
2. COMO SE PREVENIR delas? (medidas preventivas específicas e práticas)
3. SE JÁ TIVER SINTOMAS, o que fazer? (primeiros socorros, quando procurar médico, cuidados imediatos)
4. COMO SE RECUPERAR mais rápido nesse tipo de clima? (dicas de recuperação, cuidados durante convalescença)

DIFERENCIE-SE COMPLETAMENTE dos "alertas inteligentes" - aqui o foco é em:
- DOENÇAS ESPECÍFICAS relacionadas ao clima
- PREVENÇÃO MÉDICA detalhada
- TRATAMENTO e RECUPERAÇÃO
- Não apenas avisos gerais sobre o clima

Seja ESPECÍFICO, MÉDICO e DETALHADO. Mencione doenças reais, sintomas, e medidas práticas de prevenção e tratamento.`,
        },
      ];

      const content = await this.callGroqAPI(messages, 600, 0.7);
      const conditions = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && (line.startsWith('-') || line.startsWith('•') || /^\d+\./.test(line) || /^[🌡️💧💨☀️🌵🧴🏥]/u.test(line)))
        .map(line => {
          line = line.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '').trim();
          if (!/^[🌡️💧💨☀️🌵🧴🏥💊🫁❤️]/u.test(line)) {
            if (line.toLowerCase().includes('calor') || line.toLowerCase().includes('temperatura')) {
              line = '🌡️ ' + line;
            } else if (line.toLowerCase().includes('umidade') || line.toLowerCase().includes('seco')) {
              line = '💧 ' + line;
            } else if (line.toLowerCase().includes('vento')) {
              line = '💨 ' + line;
            } else if (line.toLowerCase().includes('uv') || line.toLowerCase().includes('sol')) {
              line = '☀️ ' + line;
            } else if (line.toLowerCase().includes('doença') || line.toLowerCase().includes('saúde') || line.toLowerCase().includes('risco')) {
              line = '🏥 ' + line;
            } else {
              line = '💊 ' + line;
            }
          }
          return line;
        })
        .filter(line => line.length > 20)
        .slice(0, 6);

      const result = conditions.length > 0 ? conditions : this.getFallbackHealthConditions(weatherData);
      
      const finalResult = Array.isArray(result) ? result : [];
      
      console.log('✅ [Groq] Condições de saúde geradas');
      this.setCache(cacheKey, finalResult);
      return finalResult;
    } catch (error: any) {
      if (error?.response?.status === 429) {
        console.warn('⚠️ [Groq] Quota excedida. Usando fallback estático.');
        throw error;
      }
      console.error('❌ [Groq] Erro ao gerar condições de saúde:', error?.message || error);
      throw error;
    }
  }

  private getCityRegionInfo(cityName: string): { region: string; country: string } {
    const cityRegions: { [key: string]: { region: string; country: string } } = {
      'Salvador': { region: 'Nordeste', country: 'Brazil' },
      'São Paulo': { region: 'Sudeste', country: 'Brazil' },
      'Rio de Janeiro': { region: 'Sudeste', country: 'Brazil' },
      'Fortaleza': { region: 'Nordeste', country: 'Brazil' },
      'Recife': { region: 'Nordeste', country: 'Brazil' },
      'Brasília': { region: 'Centro-Oeste', country: 'Brazil' },
      'Curitiba': { region: 'Sul', country: 'Brazil' },
      'Anchorage': { region: 'Alaska', country: 'USA' },
      'Oslo': { region: 'Escandinávia', country: 'Norway' },
      'Sapporo': { region: 'Hokkaido', country: 'Japan' },
      'Reykjavik': { region: 'Islândia', country: 'Iceland' },
      'Stockholm': { region: 'Escandinávia', country: 'Sweden' },
      'London': { region: 'Inglaterra', country: 'UK' },
      'Tokyo': { region: 'Kanto', country: 'Japan' },
      'Seattle': { region: 'Noroeste do Pacífico', country: 'USA' },
      'Mumbai': { region: 'Maharashtra', country: 'India' },
      'Manaus': { region: 'Norte', country: 'Brazil' },
      'Dubai': { region: 'Emirados Árabes', country: 'UAE' },
      'Sydney': { region: 'Nova Gales do Sul', country: 'Australia' },
      'Cairo': { region: 'Norte da África', country: 'Egypt' },
      'Moscow': { region: 'Rússia Central', country: 'Russia' },
      'Bangkok': { region: 'Sudeste Asiático', country: 'Thailand' },
    };

    return cityRegions[cityName] || { region: 'Região não especificada', country: 'País não especificado' };
  }

  private getWeatherDescription(weathercode: number): string {
    const descriptions: { [key: number]: string } = {
      0: 'Céu limpo',
      1: 'Principalmente claro',
      2: 'Parcialmente nublado',
      3: 'Nublado',
      45: 'Névoa',
      48: 'Névoa com geada',
      51: 'Garoa leve',
      53: 'Garoa moderada',
      55: 'Garoa intensa',
      56: 'Garoa congelante leve',
      57: 'Garoa congelante intensa',
      61: 'Chuva leve',
      63: 'Chuva moderada',
      65: 'Chuva intensa',
      66: 'Chuva congelante leve',
      67: 'Chuva congelante intensa',
      71: 'Neve leve',
      73: 'Neve moderada',
      75: 'Neve intensa',
      77: 'Grãos de neve',
      80: 'Pancadas de chuva leves',
      81: 'Pancadas de chuva moderadas',
      82: 'Pancadas de chuva violentas',
      85: 'Pancadas de neve leves',
      86: 'Pancadas de neve intensas',
      95: 'Tempestade leve ou moderada',
      96: 'Tempestade com granizo leve',
      99: 'Tempestade com granizo intenso',
    };
    return descriptions[weathercode] || 'Condições variáveis';
  }

  getFallbackDaySummary(weatherData: FullWeatherData, cityName: string): string {
    const weatherDesc = this.getWeatherDescription(weatherData.weathercode);
    return `Resumo do dia para ${cityName}: ${weatherDesc} com temperatura de ${weatherData.temperature}°C (sensação térmica de ${weatherData.apparent_temperature}°C), umidade de ${weatherData.humidity}% e ventos de ${weatherData.wind_speed} km/h. ${weatherData.precipitation_probability || weatherData.rain > 0 ? `Probabilidade de chuva: ${weatherData.precipitation_probability || weatherData.rain}%.` : 'Sem previsão de chuva.'}`;
  }

  getFallbackMoodInsights(weatherData: FullWeatherData): string {
    const { temperature, weathercode } = weatherData;
    const isRainy = weathercode >= 51 && weathercode <= 67;
    const isCold = temperature < 15;
    const isHot = temperature >= 30;
    const isSunny = weathercode === 0;

    if (isRainy) {
      return `O clima chuvoso em ${weathercode >= 61 ? 'dias de chuva' : 'dias com garoa'} pode criar uma atmosfera mais introspectiva e melancólica. A falta de luz solar natural pode reduzir os níveis de serotonina, potencialmente deixando algumas pessoas mais tristes ou letárgicas. No entanto, o som da chuva também pode ser relaxante e aconchegante, ideal para atividades em ambientes fechados como ler, assistir filmes ou passar tempo com pessoas queridas.`;
    } else if (isCold) {
      return `Temperaturas baixas (${temperature}°C) podem causar uma sensação de letargia e necessidade de conforto. O corpo trabalha mais para manter a temperatura, o que pode deixar você mais cansado. No entanto, o clima frio também pode ser revigorante e estimular a produção de endorfinas durante atividades físicas moderadas. Busque atividades aconchegantes e mantenha-se aquecido para preservar o bem-estar emocional.`;
    } else if (isHot && isSunny) {
      return `O clima quente e ensolarado (${temperature}°C) geralmente aumenta os níveis de energia e melhora o humor devido à exposição à luz solar, que estimula a produção de vitamina D e serotonina. No entanto, calor extremo pode causar irritabilidade e desconforto. Mantenha-se hidratado e busque sombra durante os horários mais quentes para preservar o bem-estar.`;
    } else if (isSunny) {
      return `O dia ensolarado pode trazer mais energia e bom humor! A luz solar natural estimula a produção de serotonina, conhecida como o "hormônio da felicidade", o que pode melhorar significativamente o seu estado de ânimo. Aproveite para recarregar as energias e realizar atividades ao ar livre.`;
    } else {
      return `O clima atual pode influenciar seu humor de forma moderada. Condições nubladas ou variáveis geralmente não causam grandes mudanças emocionais, mas podem criar uma atmosfera mais neutra. Aproveite o dia e mantenha atividades que tragam satisfação pessoal.`;
    }
  }

  getFallbackSmartAlerts(weatherData: FullWeatherData): string[] {
    const alerts: string[] = [];
    const { temperature, apparent_temperature, humidity, wind_speed, weathercode, precipitation_probability, uv_index } = weatherData;

    if (temperature >= 30 || apparent_temperature >= 35) {
      alerts.push(`Calor intenso previsto (${apparent_temperature}°C de sensação térmica) — mantenha-se hidratado, evite exposição prolongada ao sol e busque ambientes frescos.`);
    }

    if (temperature <= 10) {
      alerts.push(`Temperatura baixa (${temperature}°C) — agasalhe-se bem, especialmente se for sair, e evite exposição prolongada ao frio.`);
    }

    if (humidity >= 90) {
      alerts.push(`Umidade muito alta (${humidity}%) — pode causar sensação de abafamento e desconforto respiratório. Mantenha-se em ambientes bem ventilados.`);
    } else if (humidity < 30) {
      alerts.push(`Ar muito seco (${humidity}%) — pode causar irritação nos olhos e pele seca. Use hidratante e considere um umidificador.`);
    }

    if (wind_speed >= 40) {
      alerts.push(`Ventos fortes (${wind_speed} km/h) — tome cuidado com objetos soltos e evite atividades ao ar livre que possam ser perigosas.`);
    }

    if (weathercode >= 61 && weathercode <= 67) {
      alerts.push(`Chuva moderada a forte prevista — leve guarda-chuva e evite áreas alagadas.`);
    }

    if (weathercode >= 95 && weathercode <= 99) {
      alerts.push(`Alerta de tempestade! Procure abrigo imediatamente e evite sair de casa.`);
    }

    if (uv_index && uv_index >= 8) {
      alerts.push(`Índice UV extremo (${uv_index}) — evite exposição ao sol entre 10h e 16h, use protetor solar e roupas adequadas.`);
    }

    return alerts;
  }

  getFallbackMovieCriteria(weatherData: FullWeatherData): any {
    const { temperature, weathercode, precipitation_probability } = weatherData;
    const currentYear = new Date().getFullYear();

    if (weathercode >= 51 && weathercode <= 67 || (precipitation_probability && precipitation_probability > 30)) {
      return {
        tema: 'aconchegante, introspectivo',
        generos_sugeridos: ['Drama', 'Romance', 'Animação'],
        tons: ['calmo', 'introspectivo'],
        popularidade_minima: 50,
        vote_average_min: 6.0,
        year_range: { min: currentYear - 15, max: currentYear },
        description: 'Clima chuvoso favorece filmes mais introspectivos.',
      };
    } else if (temperature >= 25 && weathercode === 0) {
      return {
        tema: 'animado, energético',
        generos_sugeridos: ['Ação', 'Aventura', 'Comédia'],
        tons: ['energético', 'animado'],
        popularidade_minima: 60,
        vote_average_min: 6.5,
        year_range: { min: currentYear - 15, max: currentYear },
        description: 'Clima ensolarado e quente pede filmes animados.',
      };
    } else {
      return {
        tema: 'equilibrado, variado',
        generos_sugeridos: ['Drama', 'Comédia', 'Aventura'],
        tons: ['neutro', 'variado'],
        popularidade_minima: 50,
        vote_average_min: 6.0,
        year_range: { min: currentYear - 15, max: currentYear },
        description: 'Clima variável permite uma boa variedade de opções.',
      };
    }
  }

  getFallbackHealthConditions(weatherData: FullWeatherData): string[] {
    const conditions: string[] = [];
    const { temperature, apparent_temperature, humidity, wind_speed, uv_index } = weatherData;

    if (temperature >= 30 || apparent_temperature >= 35) {
      conditions.push('🌡️ Risco de insolação e desidratação — beba água constantemente, evite exposição prolongada ao sol e busque sombra. Pessoas com problemas cardíacos devem ter cuidado redobrado.');
    }

    if (humidity > 80) {
      conditions.push(`💧 Umidade muito alta (${humidity}%) — pode agravar problemas respiratórios como asma e bronquite. Mantenha-se em ambientes bem ventilados e evite exercícios intensos ao ar livre.`);
    } else if (humidity < 30) {
      conditions.push(`🌵 Ar muito seco (${humidity}%) — pode causar irritação nos olhos, pele seca, ressecamento das vias aéreas e agravar alergias. Use hidratante, colírios e considere um umidificador.`);
    }

    if (wind_speed > 40) {
      conditions.push(`💨 Vento forte (${wind_speed} km/h) — pode agravar alergias, causar irritação nas vias respiratórias e espalhar poluentes. Pessoas com asma ou rinite devem evitar exposição prolongada.`);
    }

    if (uv_index && uv_index >= 8) {
      conditions.push(`☀️ Índice UV extremo (${uv_index}) — risco muito alto de queimaduras solares, câncer de pele e danos oculares. Evite exposição ao sol entre 10h e 16h, use protetor solar FPS 50+ e roupas com proteção UV.`);
    } else if (uv_index && uv_index >= 6) {
      conditions.push(`☀️ Índice UV alto (${uv_index}) — risco de queimaduras solares. Use protetor solar FPS 30+ e evite exposição prolongada, especialmente entre 11h e 15h.`);
    }

    if (apparent_temperature - temperature >= 5) {
      conditions.push('🌡️ Sensação térmica muito acima da temperatura real — a umidade alta aumenta o risco de hipertermia e exaustão por calor. Vista-se com roupas leves, respiráveis e mantenha-se hidratado.');
    }

    return conditions;
  }

  getFallbackActivityRecommendations(weatherData: FullWeatherData): string[] {
    const recommendations: string[] = [];
    const { temperature, weathercode, precipitation_probability } = weatherData;
    const isRainy = weathercode >= 51 && weathercode <= 67 || (precipitation_probability && precipitation_probability > 30);
    const isCold = temperature < 15;
    const isHot = temperature >= 30;
    const isSunny = weathercode === 0;

    if (isRainy) {
      recommendations.push('Visitar museus, galerias de arte ou exposições — perfeito para dias chuvosos, oferece abrigo e enriquecimento cultural');
      recommendations.push('Sessão de cinema ou maratona de séries em casa — clima chuvoso é ideal para atividades aconchegantes em ambientes fechados');
      recommendations.push('Ler um livro em uma cafeteria aconchegante — combine cultura com conforto enquanto observa a chuva pela janela');
      recommendations.push('Jogos de tabuleiro ou videogames em casa — atividades sociais ou individuais perfeitas para dias chuvosos');
      recommendations.push('Cozinhar receitas novas ou fazer pão caseiro — aproveite o tempo em casa para experimentar na cozinha');
      recommendations.push('Visitar bibliotecas ou livrarias — ambiente tranquilo e acolhedor para ler e estudar');
    } else if (isHot && isSunny) {
      recommendations.push('Atividades aquáticas: praia, piscina ou parques aquáticos — ideal para se refrescar no calor');
      recommendations.push('Caminhada ou corrida matinal (antes das 10h) — aproveite o sol sem o calor extremo do meio-dia');
      recommendations.push('Piquenique em parques com sombra — combine alimentação saudável com atividades ao ar livre');
      recommendations.push('Visitar locais com ar-condicionado: shopping centers, bibliotecas ou centros culturais durante o horário mais quente');
      recommendations.push('Atividades aquáticas ao ar livre: stand-up paddle, caiaque ou natação — refresque-se enquanto se exercita');
      recommendations.push('Visitar cachoeiras ou áreas com água natural — aproveite a natureza para se refrescar');
    } else if (isCold) {
      recommendations.push('Visitar museus, bibliotecas ou centros culturais — ambientes fechados e aquecidos ideais para o frio');
      recommendations.push('Sessão de spa, sauna ou banho quente — atividades relaxantes que combatem o frio');
      recommendations.push('Cafés e restaurantes aconchegantes — desfrute de bebidas quentes e boa comida em ambientes confortáveis');
      recommendations.push('Atividades em casa: cozinhar, assistir filmes, ler ou fazer artesanato — aproveite o conforto do lar');
      recommendations.push('Visitar feiras cobertas ou mercados internos — explore produtos locais em ambientes aquecidos');
      recommendations.push('Aulas ou workshops em ambientes fechados — aprenda algo novo enquanto se mantém aquecido');
    } else if (isSunny && temperature >= 15 && temperature < 25) {
      recommendations.push('Ciclismo ou caminhada em parques — temperatura agradável permite exercício ao ar livre confortável');
      recommendations.push('Piquenique ou churrasco ao ar livre — clima perfeito para atividades sociais ao ar livre');
      recommendations.push('Jardinagem ou atividades de jardinagem — aproveite o clima ameno para cuidar de plantas');
      recommendations.push('Visitar pontos turísticos ao ar livre — explore a cidade com clima agradável');
      recommendations.push('Atividades esportivas ao ar livre: tênis, vôlei ou futebol — aproveite o clima perfeito para exercícios');
      recommendations.push('Passeios de bicicleta ou caminhadas em trilhas — conecte-se com a natureza em clima ideal');
    } else {
      recommendations.push('Atividades flexíveis: museus, cafés, compras ou cinema — clima variável permite diferentes opções');
      recommendations.push('Caminhada leve em áreas cobertas ou parques — adapte-se às condições do momento');
      recommendations.push('Visitar centros comerciais ou galerias — ambiente controlado para qualquer clima');
      recommendations.push('Atividades culturais: teatro, shows ou exposições — aproveite programas culturais');
      recommendations.push('Cafés temáticos ou restaurantes — desfrute de boa comida e bebida');
      recommendations.push('Atividades indoor: boliche, escape room ou jogos — diversão garantida independente do clima');
    }

    return recommendations.slice(0, 6).length > 0 ? recommendations.slice(0, 6) : [
      'Atividades adequadas ao clima atual.',
      'Explore opções culturais e de entretenimento.',
      'Aproveite o dia com atividades ao ar livre ou indoor.',
      'Visite locais interessantes da sua cidade.',
      'Desfrute de momentos de lazer e relaxamento.',
      'Experimente novas atividades e hobbies.'
    ];
  }
}
