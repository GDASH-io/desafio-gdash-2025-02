# Estratégia de IA / Insights - Desafio GDASH

## Visão Geral

A camada de IA/Insights será implementada no **NestJS** (API), pois:
- Tem acesso direto ao MongoDB com dados históricos
- Pode orquestrar geração de insights sob demanda e automática
- Facilita integração com frontend via endpoints REST
- Permite evolução de regras simples para modelos mais sofisticados

## Arquitetura de Insights

### Camadas (Clean Architecture)

```
api-nest/src/
├── domain/
│   ├── entities/
│   │   └── insight.entity.ts          # Entidade Insight
│   └── repositories/
│       └── insight.repository.ts       # Interface do repositório
├── application/
│   └── usecases/
│       ├── generate-insights.use-case.ts      # Geração sob demanda
│       ├── generate-insights-auto.use-case.ts # Geração automática (hook)
│       └── calculate-pv-metrics.use-case.ts   # Métricas específicas PV
├── infrastructure/
│   ├── ai/
│   │   ├── rules/
│   │   │   ├── soiling-risk.rule.ts
│   │   │   ├── cloudy-days.rule.ts
│   │   │   ├── heat-derating.rule.ts
│   │   │   └── wind-derating.rule.ts
│   │   ├── analyzers/
│   │   │   ├── trend-analyzer.ts       # Detecção de tendências
│   │   │   ├── statistical-analyzer.ts # Médias, desvios
│   │   │   └── text-generator.ts       # Geração de resumos
│   │   └── scorers/
│   │       ├── comfort-scorer.ts       # Pontuação conforto (0-100)
│   │       └── pv-production-scorer.ts  # Pontuação produção PV (0-100)
│   └── repositories/
│       └── insight.repository.impl.ts  # Implementação MongoDB
└── presentation/
    └── controllers/
        └── insights.controller.ts      # Endpoints REST
```

## Tipos de Insights

### 1. Insights para Energia Solar (PV)

#### a) Soiling Risk (Risco de Sujeira)
- **Regra**: Precipitação acumulada > threshold indica risco de sujeira nos painéis
- **Cálculo**: Soma de `precipitation_mm` nos últimos N dias
- **Threshold**: > 50mm em 7 dias = alto risco
- **Output**: `{ level: "high" | "medium" | "low", score: 0-100, message: "..." }`

#### b) Consecutive Cloudy Days (Dias Consecutivos Nublados)
- **Regra**: Dias consecutivos com `clouds_percent > 70%`
- **Cálculo**: Contar sequência máxima de dias nublados
- **Impacto**: Redução estimada de produção (ex: -30% por dia nublado)
- **Output**: `{ consecutive_days: number, estimated_reduction_pct: number, message: "..." }`

#### c) Heat Derating (Derating por Calor)
- **Regra**: Temperatura acima de threshold reduz eficiência PV
- **Cálculo**: `temp_effect_factor = 1 - (temp_c - 25) * 0.004` (coeficiente típico)
- **Threshold**: Temp > 35°C = derating significativo
- **Output**: `{ temp_c: number, derating_pct: number, message: "..." }`

#### d) Wind Derating (Derating por Vento)
- **Regra**: Vento extremo pode causar derating ou danos
- **Cálculo**: `wind_speed_m_s > 20 m/s` = risco alto
- **Output**: `{ wind_speed_m_s: number, risk_level: "high" | "medium" | "low", message: "..." }`

#### e) Estimated Production Impact (%)
- **Cálculo agregado**: Combina todos os fatores acima
- **Fórmula simplificada**: 
  ```
  base_production = 100%
  - (cloudy_reduction)
  - (heat_derating)
  - (soiling_penalty)
  - (wind_penalty)
  ```
- **Output**: `{ estimated_production_pct: number, factors: {...}, message: "..." }`

### 2. Insights Estatísticos

#### a) Médias e Tendências
- **Média de temperatura/umidade**: Período configurável (últimos 3, 7, 30 dias)
- **Detecção de tendência**: 
  - Regressão linear simples nos últimos N pontos
  - Slope positivo = subindo, negativo = caindo
- **Output**: `{ avg_temp: number, avg_humidity: number, trend: "rising" | "falling" | "stable", slope: number }`

#### b) Classificação do Dia
- **Regras**:
  - Frio: `temp_c < 15°C`
  - Quente: `temp_c > 30°C`
  - Agradável: `15°C <= temp_c <= 30°C` e `clouds_percent < 50%`
  - Chuvoso: `precipitation_mm > 5mm`
- **Output**: `{ classification: "frio" | "quente" | "agradável" | "chuvoso", confidence: number }`

### 3. Alertas Contextuais

- **"Alta chance de chuva"**: `precipitation_mm > 10mm` previsto nas próximas horas
- **"Calor extremo"**: `temp_c > 35°C` por mais de 3 horas consecutivas
- **"Frio intenso"**: `temp_c < 10°C` por mais de 3 horas consecutivas
- **"Vento forte"**: `wind_speed_m_s > 15 m/s`
- **Output**: `{ alerts: [{ type: string, severity: "high" | "medium" | "low", message: string }] }`

### 4. Resumos em Texto

- **Geração automática**: Template-based com dados do período
- **Exemplo**: "Nos últimos 3 dias, a temperatura média foi de 28°C, com alta umidade (75%) e tendência de chuva no fim da tarde. A produção estimada de energia solar está reduzida em 15% devido a dias consecutivos nublados."
- **Output**: `{ summary: string, period: { from: Date, to: Date }, key_points: string[] }`

### 5. Pontuações (Scores)

#### a) Conforto Climático (0-100)
- **Fórmula**: Combina temperatura ideal (20-25°C), umidade ideal (40-60%), baixa precipitação
- **Output**: `{ comfort_score: number, factors: {...} }`

#### b) Produção PV Estimada (0-100)
- **Fórmula**: Baseada em irradiância estimada, temperatura, nuvens, soiling
- **Output**: `{ pv_production_score: number, estimated_kwh: number, factors: {...} }`

## Endpoints da API

### GET `/api/v1/weather/insights`
**Query Params:**
- `from` (ISO date): Data inicial (opcional, padrão: 7 dias atrás)
- `to` (ISO date): Data final (opcional, padrão: agora)
- `types` (string[]): Tipos de insights desejados (opcional, padrão: todos)
  - Ex: `?types=pv_metrics,alerts,summary`

**Response:**
```json
{
  "period": {
    "from": "2025-11-12T00:00:00-03:00",
    "to": "2025-11-19T00:00:00-03:00"
  },
  "pv_metrics": {
    "soiling_risk": { "level": "medium", "score": 45, "message": "..." },
    "consecutive_cloudy_days": { "consecutive_days": 2, "estimated_reduction_pct": 15 },
    "heat_derating": { "temp_c": 32, "derating_pct": 2.8 },
    "wind_derating": { "wind_speed_m_s": 8, "risk_level": "low" },
    "estimated_production_pct": 82.2,
    "estimated_production_kwh": 125.5
  },
  "statistics": {
    "avg_temp": 26.5,
    "avg_humidity": 72,
    "trend": "rising",
    "slope": 0.15,
    "classification": "agradável"
  },
  "alerts": [
    { "type": "precipitation", "severity": "medium", "message": "Chuva prevista nas próximas 6h" }
  ],
  "summary": "Nos últimos 7 dias...",
  "scores": {
    "comfort_score": 75,
    "pv_production_score": 82
  },
  "generated_at": "2025-11-19T21:00:00-03:00"
}
```

### POST `/api/v1/weather/insights`
**Body:**
```json
{
  "from": "2025-11-12T00:00:00-03:00",
  "to": "2025-11-19T00:00:00-03:00",
  "types": ["pv_metrics", "alerts"]
}
```
**Response:** Mesmo formato do GET (força recálculo)

## Geração Automática

### Hook após Inserção de Dados
- Quando novo registro é inserido via `POST /api/v1/weather/logs`
- Trigger assíncrono (não bloqueia resposta)
- Gera insights para período recente (últimas 24h)
- Armazena em coleção `insights_cache` (MongoDB) com TTL de 1 hora
- Frontend pode consumir insights cacheados ou forçar recálculo

### Agendamento (Opcional)
- Cron job diário para gerar insights do dia anterior
- Armazena insights históricos para análise de tendências

## Implementação Técnica

### Tecnologias Sugeridas
- **Estatísticas**: Bibliotecas nativas TypeScript ou `simple-statistics`
- **Tendências**: Regressão linear simples (implementação própria)
- **Geração de Texto**: Templates com placeholders (ex: `handlebars`, `mustache`)
- **Cache**: MongoDB com TTL ou Redis (opcional)

### Performance
- Insights sob demanda: < 500ms para período de 7 dias
- Cache de insights: TTL de 1 hora
- Índices MongoDB: `timestamp`, `city` para queries rápidas

## Evolução Futura (Opcional)

### Modelos de ML Leves
- Regressão para previsão de produção PV
- Classificação para alertas mais precisos
- Séries temporais para previsão de tendências

### Integração com APIs de IA
- OpenAI GPT para resumos mais naturais (opcional)
- Hugging Face models locais (opcional)

## Testes

### Unitários
- Cada regra isolada (soiling, cloudy days, heat derating, etc.)
- Analisadores (trend, statistical)
- Geradores de texto
- Scorers (comfort, PV production)

### Integração
- Endpoint GET `/api/v1/weather/insights` com dados reais
- Geração automática após inserção
- Cache funcionando corretamente

## Critérios de Aceitação

- [ ] Endpoint GET `/api/v1/weather/insights` retorna insights válidos
- [ ] Insights incluem métricas PV (soiling, cloudy days, heat derating, etc.)
- [ ] Insights incluem estatísticas (médias, tendências)
- [ ] Insights incluem alertas contextuais
- [ ] Insights incluem resumo em texto
- [ ] Insights incluem pontuações (comfort, PV production)
- [ ] Geração automática funciona após inserção de dados
- [ ] Cache reduz tempo de resposta
- [ ] Testes unitários cobrem todas as regras
- [ ] Frontend exibe insights no Dashboard

