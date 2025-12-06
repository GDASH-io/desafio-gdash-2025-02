# Módulo de Insights - Documentação

O módulo de Insights fornece análises avançadas dos dados climáticos coletados, incluindo estatísticas, alertas, recomendações e resumos descritivos.

## 📊 Funcionalidades

### 1. Estatísticas Detalhadas
- **Temperatura**: Média, mínima, máxima e tendência (aumentando/diminuindo/estável)
- **Umidade**: Média e tendência
- **Vento**: Velocidade média
- **Período**: Análise configurável (padrão: 7 dias)

### 2. Pontuação de Conforto Climático (0-100)
Calculada com base em:
- **Temperatura ideal**: 20-26°C (pontuação máxima)
- **Umidade ideal**: 40-60%
- **Vento**: Ventos muito fortes reduzem o conforto
- **Penalizações**: Temperaturas extremas, umidade muito alta/baixa

**Interpretação:**
- 80-100: Condições muito confortáveis
- 60-79: Condições confortáveis
- 40-59: Condições moderadas
- 0-39: Condições desconfortáveis

### 3. Classificação do Dia
O sistema classifica o período analisado como:
- **frio**: Temperatura média < 15°C
- **quente**: Temperatura média > 30°C
- **agradável**: Temperatura 20-26°C e umidade 40-60%
- **chuvoso**: Umidade > 80% e temperatura moderada
- **variável**: Grande variação de temperatura (> 8°C)

### 4. Sistema de Alertas
Alertas automáticos baseados em condições extremas:

#### Tipos de Alertas:
- **rain** (chuva): Alta umidade e probabilidade de precipitação
- **heat** (calor): Temperaturas > 30°C
- **cold** (frio): Temperaturas < 10°C
- **wind** (vento): Ventos > 20 km/h
- **humidity** (umidade): Umidade < 20% ou > 90%

#### Níveis de Severidade:
- **high**: Condições extremas que requerem atenção
- **medium**: Condições que merecem precaução
- **low**: Condições levemente fora do normal

### 5. Recomendações Práticas
Sugestões baseadas nas condições atuais:
- Roupas adequadas
- Hidratação
- Atividades ao ar livre
- Preparação para mudanças climáticas

### 6. Resumos Descritivos
Dois modos de geração:

#### Com IA (Google Gemini)
Se `GEMINI_API_KEY` estiver configurado:
- Resumos mais naturais e descritivos
- Análise contextual dos dados
- Linguagem fluida em português brasileiro

#### Sem IA (Baseado em Regras)
Fallback automático quando IA não está disponível:
- Resumos estruturados e informativos
- Baseados em estatísticas calculadas
- Sempre disponível

## 🔌 Endpoint

### GET /api/weather/insights

**Query Parameters:**
- `days` (opcional): Número de dias para análise (padrão: 7)

**Headers:**
```
Authorization: Bearer {token}
```

**Resposta de Exemplo:**
```json
{
  "summary": "Nos últimos 7 dias, a temperatura média foi de 25.3°C, variando entre 18.5°C e 32.1°C, e umidade relativa média de 65%, com tendência de aumento de temperatura e ventos moderados a fortes (média de 18.2 km/h).",
  "statistics": {
    "averageTemperature": 25.3,
    "minTemperature": 18.5,
    "maxTemperature": 32.1,
    "averageHumidity": 65.0,
    "averageWindSpeed": 18.2,
    "temperatureTrend": "increasing",
    "humidityTrend": "stable"
  },
  "comfortScore": 72,
  "dayClassification": "quente",
  "alerts": [
    {
      "type": "heat",
      "severity": "medium",
      "message": "🌡️ Temperaturas elevadas (até 32.1°C). Tome precauções contra o calor."
    },
    {
      "type": "wind",
      "severity": "medium",
      "message": "🌬️ Ventos moderados a fortes (18.2 km/h)."
    }
  ],
  "periodAnalysis": {
    "days": 7,
    "totalRecords": 45,
    "dateRange": {
      "start": "2024-01-08T00:00:00.000Z",
      "end": "2024-01-15T00:00:00.000Z"
    }
  },
  "recommendations": [
    "Use roupas leves e claras. Mantenha-se hidratado.",
    "Temperaturas em ascensão. Prepare-se para dias mais quentes."
  ],
  "generatedAt": "2024-01-15T10:30:00.000Z"
}
```

## ⚙️ Configuração

### Habilitar IA (Opcional)
Para usar resumos gerados por IA, configure no `.env`:
```env
GEMINI_API_KEY=AIzaSy...
```

Sem a chave, o sistema usa resumos baseados em regras (sempre funcionam).

## 🧮 Algoritmos

### Cálculo de Tendência
Compara a primeira metade dos dados com a segunda metade:
- **increasing**: Aumento significativo (> threshold)
- **decreasing**: Diminuição significativa (> threshold)
- **stable**: Variação dentro do threshold

### Cálculo de Conforto
Fórmula baseada em:
1. Temperatura ideal (20-26°C): +0 pontos
2. Desvios de temperatura: -15 a -50 pontos
3. Umidade ideal (40-60%): +0 pontos
4. Desvios de umidade: -5 a -15 pontos
5. Vento forte: -5 a -10 pontos

Score final: 0-100 (arredondado)

## 📈 Casos de Uso

1. **Dashboard**: Exibir resumo e alertas em tempo real
2. **Relatórios**: Gerar análises periódicas
3. **Notificações**: Alertar sobre condições extremas
4. **Planejamento**: Recomendações para atividades ao ar livre
5. **Análise Histórica**: Comparar períodos diferentes

