# Análise de Melhorias para o Dashboard - GDASH Challenge

**Data:** 21/11/2025  
**Foco:** Energia Solar Fotovoltaica

---

## Parâmetros Atualmente Implementados

### Coletados e Armazenados

| Parâmetro | Status | Uso Atual |
|-----------|--------|-----------|
| Temperatura (°C) | ✅ Coletado | Card no dashboard, gráfico |
| Umidade Relativa (%) | ✅ Coletado | Card no dashboard |
| Velocidade do Vento (m/s) | ✅ Coletado | Card no dashboard |
| Cobertura de Nuvens (%) | ✅ Coletado | Usado para calcular irradiância |
| Precipitação (mm) | ✅ Coletado | Usado para soiling risk |
| Weather Code | ✅ Coletado | Classificação geral |
| Pressão Atmosférica (hPa) | ✅ Coletado (opcional) | Não exibido |
| Índice UV | ✅ Coletado (opcional) | Não exibido |
| Visibilidade (m) | ✅ Coletado (opcional) | Não exibido |

### Calculados pelo Worker

| Parâmetro | Status | Uso Atual |
|-----------|--------|-----------|
| Irradiância Estimada (W/m²) | ✅ Calculado | Card no dashboard, gráfico |
| PV Derating (%) | ✅ Calculado | Card no dashboard |
| Temperature Effect Factor | ✅ Calculado | Usado internamente |
| Soiling Risk | ✅ Calculado | Usado em insights |
| Wind Derating Flag | ✅ Calculado | Usado em insights |

---

## Recomendações por Prioridade

### Prioridade ALTA - Essenciais para Energia Solar

#### 1. Índice UV (UV Index)
**Status:** ✅ Já coletado, mas não exibido

**Por que adicionar:**
- Correlação direta com irradiância solar
- Indicador de produção de energia
- Útil para alertas de exposição

**Implementação:**
- Adicionar card no dashboard
- Incluir no gráfico (opcional)
- Alertas quando UV > 8 (muito alto)

**Complexidade:** Baixa (já está no banco)

---

#### 2. Pressão Atmosférica (hPa)
**Status:** ✅ Já coletado, mas não exibido

**Por que adicionar:**
- Tendência barométrica indica mudanças de tempo
- Pressão baixa = chuva = redução de produção
- Gráfico de tendência é valioso

**Implementação:**
- Card com valor atual
- Gráfico de tendência (últimas 24h)
- Indicador visual: subindo/estável/caindo
- Insight: "Pressão caindo - chuva prevista"

**Complexidade:** Baixa (já está no banco)

---

#### 3. Sensação Térmica (Heat Index / Feels Like)
**Status:** ❌ Não coletado

**Por que adicionar:**
- Combina temperatura + umidade + vento
- Melhor indicador de conforto
- Impacta operação de usinas (manutenção)

**Implementação:**
- Calcular no Worker ou API
- Fórmula: `HI = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (RH * 0.094))`
- Card no dashboard
- Alertas: >35°C (calor perigoso)

**Complexidade:** Média (requer cálculo)

---

#### 4. Direção do Vento
**Status:** ❌ Não coletado

**Por que adicionar:**
- Importante para limpeza de painéis
- Vento do norte/sul pode afetar sombreamento
- Visual interessante (bússola)

**Implementação:**
- Coletar da Open-Meteo (winddirection_10m)
- Card com bússola visual
- Indicador de direção (N, NE, E, etc.)

**Complexidade:** Média (requer coleta e UI)

---

#### 5. Rajadas de Vento (Wind Gusts)
**Status:** ❌ Não coletado

**Por que adicionar:**
- Segurança: ventos fortes podem danificar painéis
- Já calculamos wind_derating_flag, mas rajadas são mais precisas
- Alertas de segurança

**Implementação:**
- Coletar da Open-Meteo (windgusts_10m)
- Card no dashboard
- Alerta quando > 20 m/s

**Complexidade:** Média (requer coleta)

---

### Prioridade MÉDIA - Valiosos para Contexto

#### 6. Probabilidade de Chuva (%)
**Status:** ❌ Não coletado

**Por que adicionar:**
- Planejamento de manutenção
- Previsão de produção reduzida
- Card de previsão

**Implementação:**
- Coletar da Open-Meteo (precipitation_probability)
- Card com percentual
- Gráfico de probabilidade ao longo do dia

**Complexidade:** Baixa (Open-Meteo fornece)

---

#### 7. Temperatura Máxima/Mínima do Dia
**Status:** ❌ Não coletado (apenas horária)

**Por que adicionar:**
- Referência para planejamento
- Impacto na produção (máxima = derating)
- Card simples com min/max

**Implementação:**
- Calcular agregado diário na API
- Card com min/max do dia atual
- Gráfico de min/max dos últimos 7 dias

**Complexidade:** Média (requer agregação)

---

#### 8. Chuva nas Últimas 24h
**Status:** ⚠️ Parcial (temos precipitação, mas não acumulado)

**Por que adicionar:**
- Impacto direto no soiling risk
- Planejamento de limpeza
- Card de histórico

**Implementação:**
- Calcular acumulado na API (soma das últimas 24h)
- Card no dashboard
- Gráfico de acumulado

**Complexidade:** Média (requer agregação)

---

#### 9. Ponto de Orvalho (Dew Point)
**Status:** ❌ Não coletado

**Por que adicionar:**
- Indica conforto e risco de condensação
- Pode afetar painéis (condensação = sujeira)
- Dados técnicos valiosos

**Implementação:**
- Calcular: `Td = T - ((100 - RH) / 5)`
- Card no dashboard
- Alerta quando próximo da temperatura (condensação)

**Complexidade:** Média (requer cálculo)

---

### Prioridade BAIXA - Nice to Have

#### 10. Nascer e Pôr do Sol
**Status:** ❌ Não coletado

**Por que adicionar:**
- Horas de produção solar
- Estética do dashboard
- Planejamento de operação

**Implementação:**
- Calcular com biblioteca (suncalc) ou API
- Card simples com horários
- Indicador visual (dia/noite)

**Complexidade:** Baixa

---

#### 11. Visibilidade
**Status:** ✅ Coletado, mas não exibido

**Por que adicionar:**
- Neblina pode reduzir irradiância
- Segurança para manutenção
- Card simples

**Implementação:**
- Card no dashboard
- Alerta quando < 1km

**Complexidade:** Baixa (já está no banco)

---

#### 12. Tipo de Precipitação
**Status:** ❌ Não coletado

**Por que adicionar:**
- Chuva vs granizo (dano)
- Melhor classificação visual
- Ícones mais precisos

**Implementação:**
- Usar weather_code para classificar
- Ícones no card de precipitação
- Alertas para granizo

**Complexidade:** Baixa (já temos weather_code)

---

## Parâmetros NÃO Recomendados (Fora do Escopo)

### Não Essenciais para Energia Solar

| Parâmetro | Motivo |
|-----------|--------|
| Qualidade do Ar (AQI) | Não impacta produção solar diretamente |
| Cobertura de Neve | Região não aplicável (Coronel Fabriciano, MG) |
| CAPE / Cisalhamento | Muito técnico, fora do escopo |
| Albedo | Muito técnico, requer dados de solo |
| Evapotranspiração | Foco em agricultura, não energia solar |

---

## Sugestões de Cards Visuais

### Cards Principais (Atuais + Recomendados)

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Temperatura    │  │  Sensação       │  │  Umidade        │
│     25.5°C      │  │  Térmica        │  │     72%         │
│                 │  │     28.2°C      │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Irradiância    │  │  Índice UV      │  │  PV Derating   │
│   850 W/m²      │  │     8 (Alto)    │  │     2.5%       │
│                 │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Vento          │  │  Direção        │  │  Pressão       │
│   3.2 m/s       │  │     NE ↗        │  │   1013 hPa     │
│                 │  │                 │  │  ↓ caindo      │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐
│  Precipitação   │  │  Chuva 24h      │
│   0.0 mm        │  │   12.5 mm       │
│  Prob: 30%      │  │                 │
└─────────────────┘  └─────────────────┘
```

### Cards de Status Climático

```
┌─────────────────────────────────────┐
│  ☀️ Ensolarado                      │
│  Condições ideais para produção     │
│  Irradiância: 850 W/m²              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  🌤️ Parcialmente Nublado           │
│  Produção reduzida em 15%          │
│  Irradiância: 650 W/m²             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  🌧️ Chuva Leve                     │
│  Risco de soiling: Médio            │
│  Produção reduzida em 30%           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  ⚠️ Calor Extremo                   │
│  Temperatura: 38°C                  │
│  Derating: 5.2%                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  💨 Ventos Fortes                   │
│  Rajadas: 18 m/s                    │
│  Risco de dano                      │
└─────────────────────────────────────┘
```

---

## Gráficos Recomendados

### 1. Gráfico de Tendência Barométrica
- Eixo Y: Pressão (hPa)
- Eixo X: Tempo (últimas 24h)
- Linha com indicador: subindo (verde), estável (amarelo), caindo (vermelho)
- Insight: "Pressão caindo - chuva prevista nas próximas 6h"

### 2. Gráfico de Irradiância vs Nuvens
- Duas escalas Y: Irradiância (W/m²) e Cobertura de Nuvens (%)
- Mostra correlação inversa
- Útil para entender impacto de nuvens

### 3. Gráfico de Produção Estimada
- Eixo Y: Produção estimada (kWh)
- Eixo X: Tempo (últimas 24h)
- Baseado em irradiância e derating
- Mostra impacto real na produção

### 4. Gráfico de Temperatura vs Sensação Térmica
- Duas linhas: Temperatura real e Sensação térmica
- Mostra impacto da umidade e vento
- Útil para planejamento de manutenção

---

## Implementação Sugerida (Fase por Fase)

### Fase 1: Exibir Dados Já Coletados (Prioridade ALTA)
**Esforço:** Baixo  
**Impacto:** Alto

1. Adicionar card de Índice UV
2. Adicionar card de Pressão Atmosférica
3. Adicionar gráfico de tendência barométrica
4. Adicionar card de Visibilidade (quando < 1km)

### Fase 2: Coletar Novos Parâmetros (Prioridade ALTA)
**Esforço:** Médio  
**Impacto:** Alto

1. Coletar direção do vento (winddirection_10m)
2. Coletar rajadas de vento (windgusts_10m)
3. Coletar probabilidade de chuva (precipitation_probability)
4. Adicionar cards correspondentes

### Fase 3: Calcular Parâmetros Derivados (Prioridade ALTA)
**Esforço:** Médio  
**Impacto:** Alto

1. Calcular sensação térmica (no Worker ou API)
2. Calcular ponto de orvalho
3. Calcular chuva acumulada 24h (agregação na API)
4. Adicionar cards correspondentes

### Fase 4: Melhorias Visuais (Prioridade MÉDIA)
**Esforço:** Médio  
**Impacto:** Médio

1. Cards de status climático (ensolarado, nublado, etc.)
2. Bússola para direção do vento
3. Gráficos adicionais (irradiância vs nuvens, produção estimada)
4. Temperatura min/max do dia

### Fase 5: Funcionalidades Avançadas (Prioridade BAIXA)
**Esforço:** Alto  
**Impacto:** Baixo

1. Nascer e pôr do sol
2. Tipo de precipitação (granizo, etc.)
3. Gráficos históricos avançados

---

## Resumo Executivo

### Parâmetros Recomendados para Implementação

**Prioridade ALTA (Implementar Primeiro):**
1. ✅ Índice UV (já coletado - apenas exibir)
2. ✅ Pressão Atmosférica (já coletado - apenas exibir)
3. Sensação Térmica (calcular)
4. Direção do Vento (coletar)
5. Rajadas de Vento (coletar)

**Prioridade MÉDIA (Implementar Depois):**
6. Probabilidade de Chuva (coletar)
7. Temperatura Min/Max do Dia (calcular)
8. Chuva Acumulada 24h (calcular)
9. Ponto de Orvalho (calcular)

**Prioridade BAIXA (Nice to Have):**
10. Nascer e Pôr do Sol
11. Visibilidade (já coletado - apenas exibir)
12. Tipo de Precipitação (usar weather_code)

### Impacto Esperado

- **Melhor compreensão da produção solar:** Índice UV, pressão, sensação térmica
- **Melhor planejamento:** Probabilidade de chuva, min/max, chuva 24h
- **Melhor segurança:** Rajadas de vento, direção do vento
- **Melhor UX:** Cards visuais, gráficos informativos

---

**Última atualização:** 21/11/2025

