# Fase 6 - IA/Insights (NestJS)

**Status:** Concluída  
**Data de Conclusão:** 21/11/2025  
**Progresso:** 100%

---

## Objetivo

Implementar módulo completo de insights baseados em IA que analise dados históricos de clima, gere métricas específicas para energia solar fotovoltaica, produza análises estatísticas, gere resumos em texto e calcule pontuações de conforto e produção PV.

## Requisitos do Desafio

Conforme README.md do desafio:

- Gerar insights baseados em IA a partir das informações climáticas
- Podendo ser gerados automaticamente, sob demanda, ou de qualquer outra forma
- Exibir insights no Dashboard do frontend

## Arquitetura Implementada

### Clean Architecture

O módulo de Insights segue Clean Architecture:

```
api-nest/src/
├── domain/
│   ├── entities/
│   │   └── insight.entity.ts
│   └── repositories/
│       └── insight.repository.ts
├── application/
│   └── usecases/
│       └── insights/
│           ├── generate-insights.use-case.ts
│           └── get-insights.use-case.ts
├── infra/
│   ├── ai/
│   │   ├── rules/
│   │   │   ├── soiling-risk.rule.ts
│   │   │   ├── consecutive-cloudy-days.rule.ts
│   │   │   ├── heat-derating.rule.ts
│   │   │   └── wind-derating.rule.ts
│   │   ├── analyzers/
│   │   │   ├── statistical-analyzer.ts
│   │   │   ├── trend-analyzer.ts
│   │   │   └── day-classifier.ts
│   │   ├── generators/
│   │   │   └── text-generator.ts
│   │   └── scorers/
│   │       ├── comfort-scorer.ts
│   │       └── pv-production-scorer.ts
│   └── database/
│       └── repositories/
│           └── insight.repository.impl.ts
├── presentation/
│   ├── controllers/
│   │   └── insights.controller.ts
│   └── dto/
│       ├── get-insights-query.dto.ts
│       └── generate-insights.dto.ts
└── modules/
    └── insights/
        └── insights.module.ts
```

## Componentes Principais

### 1. Regras Heurísticas (Rules)

#### SoilingRiskRule

**Objetivo:** Calcular risco de sujeira nos painéis solares

**Lógica:**
- Calcula precipitação acumulada dos últimos 7 dias
- Classifica risco: high (>50mm), medium (>25mm), low (<25mm)
- Gera mensagem contextual

**Thresholds:**
- HIGH_RISK_THRESHOLD: 50mm
- MEDIUM_RISK_THRESHOLD: 25mm

#### ConsecutiveCloudyDaysRule

**Objetivo:** Detectar dias consecutivos nublados

**Lógica:**
- Agrupa logs por dia
- Calcula média de nuvens por dia
- Detecta sequência máxima de dias com >70% de nuvens
- Calcula redução estimada (15% por dia)

**Thresholds:**
- CLOUDY_THRESHOLD: 70%
- REDUCTION_PER_DAY: 15%

#### HeatDeratingRule

**Objetivo:** Calcular derating por temperatura alta

**Lógica:**
- Calcula temperatura média do período
- Aplica fórmula: `(temp - 25) * 0.004 * 100`
- Identifica calor extremo (>35°C)

**Fórmula:**
```
derating_pct = (avg_temp - 25) * 0.004 * 100
```

#### WindDeratingRule

**Objetivo:** Detectar risco de vento extremo

**Lógica:**
- Calcula velocidade média e máxima do vento
- Classifica risco: high (>20 m/s), medium (>15 m/s), low (<15 m/s)
- Gera alerta se necessário

**Thresholds:**
- HIGH_RISK_THRESHOLD: 20 m/s
- MEDIUM_RISK_THRESHOLD: 15 m/s

### 2. Analisadores (Analyzers)

#### StatisticalAnalyzer

**Funcionalidades:**
- Média de temperatura e umidade
- Temperatura mínima e máxima
- Desvio padrão de temperatura e umidade

**Métodos:**
- `analyze(logs: WeatherLog[]): StatisticalResult`

#### TrendAnalyzer

**Funcionalidades:**
- Regressão linear simples
- Detecção de tendência: rising, falling, stable
- Cálculo de slope e confidence

**Algoritmo:**
- Regressão linear: y = a + b*x
- Slope positivo = rising, negativo = falling
- Threshold para stable: |slope| < 0.1

#### DayClassifier

**Funcionalidades:**
- Classificação do dia: frio, quente, agradável, chuvoso
- Cálculo de confidence score
- Considera temperatura, umidade, precipitação, nuvens

**Regras:**
- Frio: temp < 15°C
- Quente: temp > 30°C
- Chuvoso: precipitação > 5mm
- Agradável: 15°C ≤ temp ≤ 30°C, clouds < 50%, precip < 5mm

### 3. Geradores (Generators)

#### TextGenerator

**Funcionalidades:**
- Geração de resumo do período
- Geração de alertas contextuais
- Templates baseados em dados

**Resumo:**
- Inclui temperatura média, umidade, tendência
- Menciona classificação do dia
- Lista fatores que reduzem produção

**Alertas:**
- Chuva prevista (>10mm)
- Calor extremo (>35°C por 3h+)
- Frio intenso (<10°C por 3h+)
- Vento forte (>15 m/s)

### 4. Scorers

#### ComfortScorer

**Objetivo:** Calcular pontuação de conforto climático (0-100)

**Fatores:**
- Temperatura ideal: 20-25°C (50 pontos)
- Umidade ideal: 40-60% (30 pontos)
- Precipitação: penalidade (20 pontos)

**Fórmula:**
```
comfort_score = temp_score + humidity_score + precipitation_penalty
```

#### PVProductionScorer

**Objetivo:** Calcular pontuação de produção PV (0-100)

**Fatores:**
- Irradiância estimada (40 pontos)
- Temperatura (20 pontos)
- Nuvens (20 pontos)
- Sujeira (20 pontos)

**Fórmula:**
```
pv_score = irradiance_score + temp_penalty + clouds_penalty + soiling_penalty
```

## Endpoints Implementados

### GET /api/v1/weather/insights

**Descrição:** Busca insights com cache

**Query Parameters:**
- `from` (obrigatório): Data inicial (ISO 8601)
- `to` (obrigatório): Data final (ISO 8601)
- `types` (opcional): Tipos de insights (separados por vírgula)

**Resposta:**
```json
{
  "period": {
    "from": "2025-11-14T00:00:00-03:00",
    "to": "2025-11-21T00:00:00-03:00"
  },
  "pv_metrics": {
    "soiling_risk": { ... },
    "consecutive_cloudy_days": { ... },
    "heat_derating": { ... },
    "wind_derating": { ... },
    "estimated_production_pct": 82.2,
    "estimated_production_kwh": 125.5
  },
  "statistics": { ... },
  "alerts": [ ... ],
  "summary": "...",
  "scores": {
    "comfort_score": 75,
    "pv_production_score": 82
  },
  "generated_at": "2025-11-21T21:00:00-03:00"
}
```

### POST /api/v1/weather/insights

**Descrição:** Força regeneração de insights (ignora cache)

**Body:**
```json
{
  "from": "2025-11-14T00:00:00-03:00",
  "to": "2025-11-21T00:00:00-03:00",
  "types": ["pv_metrics", "alerts"]
}
```

## Cache de Insights

### Estratégia

- Cache em MongoDB com TTL de 1 hora
- Chave baseada em período (from, to) e tipos
- Invalidação automática via TTL index

### Modelo de Cache

```typescript
{
  period_from: Date;        // Indexado
  period_to: Date;          // Indexado
  types: string[];          // Indexado
  pv_metrics: object;
  statistics: object;
  alerts: Alert[];
  summary: string;
  scores: object;
  generated_at: Date;
  expires_at: Date;         // TTL index (1 hora)
}
```

## Integração no Frontend

### Componente InsightsSection

**Localização:** `frontend-react/src/components/Insights/InsightsSection.tsx`

**Funcionalidades:**
- Busca insights dos últimos 7 dias
- Exibe resumo gerado por IA
- Mostra pontuações (conforto e produção PV)
- Exibe métricas PV detalhadas
- Lista estatísticas
- Mostra alertas contextuais com cores

**Integração:**
- Integrado no Dashboard
- Atualização sob demanda
- Loading states
- Error handling

## Algoritmos e Fórmulas

### Produção Estimada

```
base_production = 100%
- (cloudy_reduction)
- (heat_derating)
- (soiling_penalty)
- (wind_penalty)
```

### Tendência (Regressão Linear)

```
slope = (n * Σ(xy) - Σ(x) * Σ(y)) / (n * Σ(x²) - (Σ(x))²)
```

### Classificação de Dia

Prioridade:
1. Chuvoso (precipitação > 5mm)
2. Frio (temp < 15°C)
3. Quente (temp > 30°C)
4. Agradável (outros casos)

## Performance

### Otimizações

- Cache de insights (TTL 1 hora)
- Queries otimizadas com índices
- Processamento assíncrono (futuro)
- Batch processing (futuro)

### Métricas

- Tempo de geração: < 500ms (período de 7 dias)
- Tempo de cache hit: < 100ms
- Uso de memória: Baixo (processamento em memória)

## Testes

### Status

- Testes unitários: Pendente
- Testes de integração: Pendente

### Estrutura Proposta

```
api-nest/src/
└── infra/ai/
    ├── rules/
    │   └── *.rule.spec.ts
    ├── analyzers/
    │   └── *.analyzer.spec.ts
    └── scorers/
        └── *.scorer.spec.ts
```

## Decisões Técnicas

### 1. Localização

**Decisão:** Implementar no NestJS

**Razões:**
- Acesso direto ao MongoDB
- Orquestração centralizada
- Integração fácil com frontend
- Evolução para modelos mais sofisticados

### 2. Abordagem de IA

**Decisão:** Regras heurísticas ao invés de ML

**Razões:**
- Transparência
- Interpretabilidade
- Performance
- Facilidade de ajuste

### 3. Cache

**Decisão:** MongoDB com TTL

**Razões:**
- Simplicidade
- Sem dependências adicionais
- TTL automático
- Facilita evolução para Redis

## Próximos Passos (Melhorias Futuras)

1. Geração automática após inserção (hook)
2. Agendamento diário para insights históricos
3. Testes unitários e de integração
4. Cache Redis (opcional)
5. Modelos de ML leves (opcional)

## Referências

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Regressão Linear](https://en.wikipedia.org/wiki/Linear_regression)
- [PV System Performance](https://www.nrel.gov/docs/fy12osti/51664.pdf)

---

**Última atualização:** 21/11/2025

