# Vector Store Setup

## Passo 1: Upload da Base de Conhecimento

Execute o script para criar o vector store na OpenAI:

```bash
cd vector
python uploadvector.py
```

O script irá:

1. Ler a base de conhecimento em `clima_kb.jsonl`
2. Criar um vector store na OpenAI
3. Fazer upload do arquivo
4. Retornar o ID do vector store

## Passo 2: Configurar o ID do Vector Store

Copie o ID retornado e adicione no arquivo `.env` na raiz do projeto:

```env
OPENAI_VECTOR_STORE_ID=vs_xxxxxxxxxxxxxxxxxxxxxx
```

## Passo 3: Reiniciar o Serviço NestJS

```bash
docker-compose restart nestjs-api
```

## Base de Conhecimento

O arquivo `clima_kb.jsonl` contém conhecimento meteorológico sobre:

1. **Heat Index** - Faixas de risco térmico
2. **Humidex** - Índice canadense de desconforto
3. **UTCI** - Universal Thermal Climate Index
4. **Probabilidade de Chuva** - Interpretação de valores
5. **Intensidade de Chuva** - Classificação em mm/h
6. **Wind Chill** - Sensação térmica com vento
7. **Ondas de Calor** - Impactos na saúde
8. **Tendências Temporais** - Análise de padrões

## Como Funciona

1. O endpoint `/weather/insights/advanced` recebe dados meteorológicos
2. O sistema cria um prompt com termos de busca (heat index, humidex, UTCI, etc.)
3. A OpenAI Assistants API usa o tool `file_search` para buscar no vector store
4. Retorna insights baseados no conhecimento científico com evidências
5. Frontend exibe as evidências em cards informativos
