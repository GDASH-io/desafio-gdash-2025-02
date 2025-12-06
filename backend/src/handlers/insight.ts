import { getDailyWeatherAll } from "@/db/models/dailyWeather";
import { RequestMessageLLM } from "./llm";
import { getLatestCurrentWeather } from "@/db/models/currentWeatcher";
import { getUpcomingHourlyWeather } from "@/db/models/hourlyWeather";
import { deleteInsightsByTime, insertInsight } from "@/db/models/insight";
import { FormatCurrentWeatherToCsv, FormatDailyWeatherToCsv, FormatDate, FormatHourlyWeatherToCsv } from "./utils";

interface LLmResponse {
  insights: string[]
}

export async function generateInsightByHourly():Promise<string[]> {
  const current = await getLatestCurrentWeather();
  if (!current) {
    return [];
  }
  const hourly = await getUpcomingHourlyWeather(Date.now(), 24);

  const currentCsv = FormatCurrentWeatherToCsv(current)
  const hourlyCsv = FormatHourlyWeatherToCsv(hourly)

  const systemInstruction = `
    <role>
    Você é uma IA meteorologista com personalidade ousada e extremamente útil (estilo "amigo sincero e rabugento").
    </role>

    <objective>
    - Varra os dados das próximas 24 horas para identificar os PEAKs (máximas de calor, vento, umidade, chuva acumulada) que definem o dia.
    - Gere um objeto JSON contendo exatamente 3 insights longos e distintos.
    - INTEGRALIDADE DOS DADOS: Sua função principal é validar o insight com PROVAS NUMÉRICAS retiradas do CSV.
    </objective>

    <rules>
    - Saída OBRIGATÓRIA: Apenas JSON válido cru (Raw JSON).
    - PROIBIDO usar blocos de código Markdown.
    - Interface: { "insights": ["frase longa 1", "frase longa 2", "frase longa 3"] }
    - Idioma: Português Brasil (pt-BR).
    - Os 3 insights sejam assuntos coisas diferentes.
    - Que sejam úteis, mas com humor ácido.
    </rules>

    <instruction>
    - Analise os DADOS ATUAIS e a PREVISÃO das Próximas 24 HORAS e encontre os valores mais extremos ou notáveis (pico de calor, muita chuva, vento forte, umidade desértica, etc) baseados no que for mais marcante (ou irritante) nos dados.
    - Gere 3 insights sarcásticos onde O NÚMERO é a estrela da frase.
    </instruction>
  `;

  const userPrompt = `
    <context>
    LEGENDA DAS COLUNAS (DADOS DE AGORA) (MAPEAMENTO):
      [time]: Data e hora exata da previsão ou leitura (formato dd/mm/aaaa, hh:mm:ss).
      [temperature2m]: Temperatura instantânea do ar medida a 2 metros do solo (°C).
      [relativeHumidity2m]: Umidade relativa do ar medida a 2 metros do solo (%).
      [apparentTemperature]: Sensação térmica instantânea percebida, combinando a temperatura real, umidade e vento (°C).
      [isDay]: Indicador binário se é dia ou noite no momento do registro (1 = Dia, 0 = Noite).
      [precipitation]: Quantidade de precipitação (chuva, neve, granizo) acumulada no intervalo de tempo anterior (mm).
      [weatherCode]: Código numérico (padrão WMO) que representa a condição do tempo naquele momento (ex: 0 = céu limpo, 61 = chuva leve).
      [cloudCover]: Porcentagem total do céu coberto por nuvens (%).
      [windSpeed10m]: Velocidade média do vento a 10 metros de altura (km/h).
      [windDirection10m]: Direção de onde o vento está soprando, em graus (0° = Norte, 90° = Leste, 180° = Sul, 270° = Oeste).
      [windGusts10m]: Velocidade das rajadas de vento momentâneas (picos de vento) a 10 metros de altura (km/h).

    ====== >>> DADOS DE AGORA (Formato CSV) <<< ======
    ${currentCsv}

    LEGENDA DAS COLUNAS (PREVISÃO PRÓXIMAS 24 HORAS) (MAPEAMENTO):
      [time]: Data e hora da previsão (formato dd/mm/aaaa, hh:mm:ss).
      [temperature2m]: Temperatura do ar medida a 2 metros do solo (°C).
      [relativeHumidity2m]: Umidade relativa do ar medida a 2 metros do solo (%).
      [apparentTemperature]: Sensação térmica, combinando a temperatura real, umidade e vento (°C).
      [precipitationProbability]: Probabilidade (chance percentual) de ocorrência de precipitação no horário específico (%).
      [precipitation]: Quantidade de precipitação (chuva, neve, granizo) prevista para a hora (mm).
      [weatherCode]: Código numérico (padrão WMO) que representa a condição do tempo (ex: 0 = céu limpo, 61 = chuva leve).
      [cloudCover]: Porcentagem total do céu coberto por nuvens (%).
      [windSpeed10m]: Velocidade média do vento a 10 metros de altura (km/h).
      [windGusts10m]: Velocidade das rajadas de vento (picos momentâneos) a 10 metros de altura (km/h).
      [visibility]: Distância da visibilidade horizontal (m). Nota: Valores baixos indicam neblina ou chuva forte.
    
    ====== PREVISÃO PRÓXIMAS 24 HORAS (Formato CSV) ======
    ${hourlyCsv}
    </context>

    Tarefa: Gere 3 insights longos e ácidos.

    Gere apenas o JSON agora.
  `;

  try {
    const resp_str = await RequestMessageLLM(userPrompt, systemInstruction, "json");
    const cleanResponse = resp_str.replace(/```json|```/g, '').trim();
    const data:LLmResponse = JSON.parse(cleanResponse);

    deleteInsightsByTime(current.time)

    await Promise.all(data.insights.map(async insight => {
      await insertInsight({time: current.time, insight: insight})
    }))
    return data.insights
  } catch (error) {
    console.warn("Erro ao gerar/processar insights, tentando novamente...");
    return generateInsightByHourly()
  }
}

export async function generateInsightsByDay(day: Date): Promise<string[]> {
  try {
    const allDays = await getDailyWeatherAll();
    
    const targetDateStr = FormatDate(day)
    const targetIndex = allDays.findIndex(d => d.time.toLocaleDateString("pt-BR").startsWith(targetDateStr));

    const pastDays = allDays.slice(0, targetIndex);
    const targetDay = allDays[targetIndex];
    const futureDays = allDays.slice(targetIndex + 1, allDays.length);

    const pastDaysCsv = FormatDailyWeatherToCsv(pastDays)
    const targetDayCsv = FormatDailyWeatherToCsv([targetDay])
    const futureDaysCsv = FormatDailyWeatherToCsv(futureDays)

    const systemInstruction = `
      <role>
      Você é uma IA meteorologista com personalidade ousada, extremamente analítica (estilo "amigo sincero, rabugento e detalhista").
      </role>

      <objective>
      - Sua missão é destruir ou exaltar o dia ${targetDateStr} usando Fatos e Números.
      - Você DEVE ler os 'DADOS DIAS PASSADOS' e 'DADOS PREVISÃO PROXIMOS DIAS' para contextualizar sua crítica.
      - Não diga apenas "está quente". Diga "está 3°C mais quente que a miséria da semana passada".
      </objective>

      <rules>
      - Saída OBRIGATÓRIA: Apenas JSON válido cru.
      - FORMATO ESTRITO: { "insights": ["frase longa 1", "frase longa 2", "frase longa 3"] }.
      - SUJEITO: Todas as 3 frases DEVEM começar estritamente com: "O dia ${targetDateStr}".
      - DADOS REAIS: É obrigatório incluir os números exatos do CSV na frase (ex: "com ridículos 22.5°C", "rajadas de 100 km/h").
      - O Dia ${targetDateStr} É O SUJEITO DA FRASE.
      </rules>

      <instruction>
      Gere 3 insights longos e ácidos sobre o dia ${targetDateStr}:

      1. **Análise de Tendência (Passado vs Alvo):** O dia ${targetDateStr} é um choque térmico comparado à média dos dias anteriores? Use os números para provar.
      2. **Análise de Previsão (Alvo vs Futuro):** O dia ${targetDateStr} é a última chance de felicidade antes do caos futuro ou o início dele?
      3. **Extremos e Conforto:** Analise o índice UV, Vento ou Umidade do dia alvo. Se o UV for alto, critique quem sai sem protetor. Se a umidade for baixa, reclame da secura.
      4. **Julgamento Social:** Baseado na precipitação (chuva) e temperatura do dia alvo, julgue se é dia de "ficar no sofá" ou "sofrer no transporte".
      5. **Veredito Final:** Um resumo sarcástico usando o 'ApparentTemperature' (sensação térmica) para dizer como o humano vai se sentir na pele.

      Lembre-se: Frases longas, detalhadas, conectadas, citando valores numéricos dos CSVs para dar credibilidade ao seu sarcasmo.
      </instruction>
    `;

    const userPrompt = `
      <context>
      LEGENDA DAS COLUNAS (MAPEAMENTO):
        [date]: Data do registro da previsão (DD/MM).
        [weatherCode]: Código numérico (padrão WMO) que representa a condição do tempo.
        [temperature2mMax]: Temperatura máxima do ar medida a 2 metros do solo (°C).
        [temperature2mMin]: Temperatura mínima do ar medida a 2 metros do solo (°C).
        [temperature2mMean]: Temperatura média diária do ar a 2 metros do solo (°C).
        [apparentTemperatureMax]: Sensação térmica máxima percebida, considerando umidade e vento (°C).
        [apparentTemperatureMin]: Sensação térmica mínima percebida, considerando umidade e vento (°C).
        [sunrise]: Horário exato do nascer do sol (formato ISO8601).
        [sunset]: Horário exato do pôr do sol (formato ISO8601).
        [uvIndexMax]: Índice máximo de radiação ultravioleta (UV) atingido durante o dia.
        [precipitationSum]: Soma total de precipitação (chuva, neve, granizo) acumulada no dia (mm).
        [precipitationHours]: Número total de horas em que houve precipitação (h).
        [precipitationProbabilityMax]: Probabilidade máxima (chance percentual) de ocorrência de precipitação (%).
        [windGusts10mMax]: Velocidade máxima das rajadas de vento a 10 metros de altura (km/h).
        [sunshineDuration]: Tempo total de duração da luz solar direta, expresso em segundos (s).
        [relativeHumidity2mMax]: Umidade relativa do ar máxima registrada a 2 metros do solo (%).
        [cloudCoverMean]: Porcentagem média do céu coberto por nuvens durante o dia (%).
        [capeMax]: Energia Potencial Convectiva Disponível máxima (J/kg) — indica a instabilidade atmosférica e o potencial para tempestades fortes.

      === DADOS DIAS PASSADOS FORMATO CSV ===
      ${pastDaysCsv}

      === >>> DADOS DO DIA ${targetDateStr} FORMATO CSV <<< ===
      ${targetDayCsv}

      === DADOS PREVISÃO PROXIMOS DIAS FORMATO CSV ===
      ${futureDaysCsv}
      </context>

      Tarefa: Gere 3 insights longos e ácidos sobre o dia ${targetDateStr}.
  
      EXEMPLO de formato de resposta esperado (apenas o JSON):
      {
        "insights": [
          "O dia ${targetDateStr} decide humilhar a semana anterior registrando 35.2°C, o que é absurdamente maior que a média patética de 28°C que vínhamos tendo.",
          "O dia ${targetDateStr} engana os otimistas com sol, mas o vento de 45 km/h vai destruir qualquer tentativa de penteado decente.",
          ...
        ]
      }

      Gere apenas o JSON final agora.
    `;

    const resp_str = await RequestMessageLLM(userPrompt, systemInstruction, "json");
    const cleanResponse = resp_str.replace(/```json|```/g, '').trim();
    
    const data: LLmResponse = JSON.parse(cleanResponse);
    await Promise.all(data.insights.map(async (insight) => {
      await insertInsight({ time: day, insight: insight });
    }));
    return data.insights
  } catch (error) {
    // Chance de erro muito alta
    console.warn("Erro ao gerar insights diários, tentando novamente...", error);
    return generateInsightsByDay(day);
  }
}