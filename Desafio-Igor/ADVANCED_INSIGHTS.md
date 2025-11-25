# Implementação de Insights Avançados com Vector Store

## Resumo das Alterações

### Backend (NestJS)

1. **AdvancedInsightsService** (`services/nestjs-api/src/weather/advanced-insights.service.ts`)

   - Integração com OpenAI Assistants API
   - Uso do tool `file_search` para buscar no vector store
   - Extração de evidências das anotações `file_citation`
   - Retorna JSON estruturado com insights e evidências científicas

2. **WeatherController**

   - Novo endpoint: `GET /weather/insights/advanced?limit=20`
   - Retorna objeto `AdvancedInsight` com evidências

3. **Environment**
   - Adicionado `OPENAI_VECTOR_STORE_ID` no `.env` (precisa ser preenchido)
   - Modelo alterado para `gpt-4-turbo-preview`

### Frontend (React)

4. **AdvancedInsightsPanel** (`services/react-frontend/src/components/AdvancedInsightsPanel.tsx`)

   - Componente completo com UI moderna
   - Exibe resumo geral, classificação, métricas de conforto térmico
   - Alertas e recomendações práticas
   - **Cards de evidências** com título, conteúdo, fonte e relevância
   - Botão "Gerar Insights" que chama o endpoint

5. **Dashboard**
   - Importa e renderiza `AdvancedInsightsPanel`
   - Posicionado após os insights básicos

### Vector Store

6. **uploadvector.py**

   - Script atualizado para usar variáveis de ambiente
   - Usa `OPENAI_API_KEY` do .env

7. **clima_kb.jsonl**

   - Base de conhecimento com 8 conceitos meteorológicos
   - Heat Index, Humidex, UTCI, Precipitação, Wind Chill, etc.

8. **README.md**
   - Instruções completas de setup do vector store

## Próximos Passos

### 1. Criar Vector Store (OBRIGATÓRIO)

```bash
cd vector
python uploadvector.py
```

Copie o ID retornado e adicione no `.env`:

```env
OPENAI_VECTOR_STORE_ID=vs_xxxxxxxxxxxxxxxxxxxxxx
```

### 2. Reiniciar Serviço

```bash
docker-compose restart nestjs-api
```

### 3. Testar

1. Acesse o Dashboard
2. Clique em "Gerar Insights"
3. Verifique:
   - Resumo geral com classificação do momento
   - Métricas de conforto térmico e risco
   - Alertas específicos
   - Recomendações práticas
   - **Cards de evidências** mostrando fontes científicas

## Como Funciona

1. **Upload**: `uploadvector.py` cria vector store e faz upload do `clima_kb.jsonl`
2. **Backend**: `AdvancedInsightsService` cria um assistant com tool `file_search`
3. **Query**: Quando chamado, cria thread com dados meteorológicos
4. **Search**: OpenAI busca no vector store termos como "heat index", "humidex", "UTCI"
5. **Response**: Assistant retorna JSON estruturado + anotações de citação
6. **Evidence**: Extrai `file_citation` annotations e adiciona ao array `evidencias`
7. **Frontend**: Exibe insights com cards mostrando as fontes científicas

## Estrutura da Resposta

```json
{
  "resumo_geral": "Dia quente com alto desconforto térmico...",
  "classificacao_momento": "Calor Extremo",
  "nivel_conforto_termico": "muito_alto",
  "risco_para_grupos_sensiveis": "alto",
  "tendencia_temperatura": "subida",
  "tendencia_chuva": "sem_chuva_relevante",
  "alertas": ["Possível onda de calor..."],
  "recomendacoes_praticas": ["Evite exercícios ao ar livre..."],
  "evidencias": [
    {
      "titulo": "Heat Index - Faixas de Risco",
      "conteudo": "Heat Index acima de 40°C indica perigo extremo...",
      "fonte": "Vector Store",
      "relevancia": 0.9
    }
  ]
}
```

## Benefícios

- **Transparência**: Usuário vê as fontes científicas dos insights
- **Confiabilidade**: Insights baseados em conhecimento meteorológico validado
- **Educação**: Cards informativos ensinam conceitos como Humidex, UTCI
- **Escalabilidade**: Fácil adicionar mais conhecimento ao vector store
- **Profissionalismo**: Sistema fundamentado, não apenas texto gerado
