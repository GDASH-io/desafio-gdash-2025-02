# 🏗️ Arquitetura do Sistema - Desafio GDASH 2025/02

## 📊 Visão Geral

Este documento descreve a arquitetura completa do sistema desenvolvido para o desafio técnico GDASH 2025/02. O sistema implementa um pipeline de dados climáticos que integra múltiplas tecnologias e linguagens de programação.

---

## 🔄 Fluxo de Dados Principal

```
┌─────────────┐
│ Open-Meteo  │
│   API       │
└──────┬──────┘
       │
       ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Python    │─────▶│  RabbitMQ   │─────▶│  Go Worker │
│  Collector  │      │   (Fila)    │      │            │
└─────────────┘      └─────────────┘      └──────┬──────┘
                                                  │
                                                  ▼
                                         ┌─────────────┐
                                         │   NestJS    │
                                         │     API     │
                                         └──────┬──────┘
                                                │
                                                ▼
                                         ┌─────────────┐
                                         │  MongoDB    │
                                         │  (Storage)  │
                                         └──────┬──────┘
                                                │
                                                ▼
                                         ┌─────────────┐
                                         │   React     │
                                         │  Frontend   │
                                         └─────────────┘
```

---

## 🧩 Componentes do Sistema

### 1. Collector Python (`/collector-python`)

**Responsabilidade:** Coleta periódica de dados climáticos

**Tecnologias:**
- Python 3.x
- Bibliotecas: `requests`, `pika`, `python-dotenv`

**Funcionalidades:**
- Busca dados da API Open-Meteo (ou OpenWeather) a cada 1 hora (configurável)
- Normaliza dados climáticos (temperatura, umidade, vento, condição, probabilidade de chuva)
- Publica mensagens JSON na fila RabbitMQ
- Implementa retry em caso de falha na publicação

**Fluxo Interno:**
```
Loop Principal
    │
    ├─▶ Buscar dados da API climática
    │   │
    │   └─▶ Normalizar dados
    │       │
    │       └─▶ Publicar no RabbitMQ
    │
    └─▶ Aguardar intervalo configurado
```

**Estrutura de Dados Enviada:**
```json
{
  "city": "Maceió",
  "timestamp": "2025-01-19T12:00:00Z",
  "temperatureC": 29.3,
  "humidity": 0.78,
  "windSpeedKmh": 14.2,
  "condition": "cloudy",
  "rainProbability": 0.4,
  "raw": { ... }
}
```

---

### 2. RabbitMQ (Message Broker)

**Responsabilidade:** Fila de mensagens assíncrona

**Configuração:**
- Fila durável: `weather.readings`
- Mensagens persistentes
- Management UI na porta 15672

**Vantagens:**
- Desacoplamento entre produtor (Python) e consumidor (Go)
- Garantia de entrega (mensagens persistentes)
- Escalabilidade (múltiplos workers podem consumir)
- Resiliência (mensagens não são perdidas se o worker cair)

---

### 3. Worker Go (`/worker-go`)

**Responsabilidade:** Consumir fila e enviar dados para API

**Tecnologias:**
- Go 1.21+
- Bibliotecas: `github.com/rabbitmq/amqp091-go`, `net/http`, `encoding/json`

**Funcionalidades:**
- Consome mensagens do RabbitMQ de forma assíncrona
- Valida estrutura dos dados recebidos
- Envia dados para API NestJS via HTTP POST
- Implementa retry com backoff exponencial (até 3 tentativas)
- Confirmação de mensagens (ack/nack)
- Logs detalhados das operações

**Fluxo Interno:**
```
Conexão RabbitMQ
    │
    ├─▶ Declarar fila
    │
    ├─▶ Configurar QoS (prefetch: 1)
    │
    └─▶ Consumir mensagens
        │
        ├─▶ Deserializar JSON
        │
        ├─▶ Validar campos obrigatórios
        │
        └─▶ Enviar para API NestJS
            │
            ├─▶ Sucesso → ACK
            │
            └─▶ Falha → Retry (até 3x) → ACK
```

**Tratamento de Erros:**
- Validação de campos obrigatórios
- Retry automático em caso de falha na API
- Backoff exponencial entre tentativas
- Logs de erro para debugging

---

### 4. API NestJS (`/backend`)

**Responsabilidade:** Backend principal com lógica de negócio

**Tecnologias:**
- NestJS (TypeScript)
- MongoDB com Mongoose
- JWT para autenticação
- Swagger para documentação

**Módulos Principais:**

#### 4.1. Módulo de Clima (`weather`)

**Endpoints:**
- `POST /api/weather/logs` - Ingestão de dados (usado pelo worker)
- `GET /api/weather/logs` - Listar registros com filtros
- `GET /api/weather/logs/latest` - Último registro
- `GET /api/weather/export.csv` - Exportar CSV
- `GET /api/weather/export.xlsx` - Exportar XLSX

**Fluxo de Armazenamento:**
```
POST /api/weather/logs
    │
    ├─▶ WeatherController.create()
    │
    ├─▶ Validação DTO (CreateWeatherLogDto)
    │
    ├─▶ WeatherService.create()
    │
    ├─▶ WeatherLogModel.create() (Mongoose)
    │
    └─▶ MongoDB (Coleção: weather_logs)
```

**Schema MongoDB:**
```typescript
{
  city: string;
  timestamp: Date;
  temperatureC: number;
  humidity: number;
  windSpeedKmh: number;
  condition: string;
  rainProbability: number;
  raw?: object;
  createdAt: Date;
  updatedAt: Date;
}
```

**Índices:**
- `{ timestamp: -1 }` - Consultas por data
- `{ city: 1, timestamp: -1 }` - Consultas por cidade e data

#### 4.2. Módulo de Insights (`insights`)

**Responsabilidade:** Geração de insights inteligentes a partir dos dados

**Endpoint:**
- `GET /api/insights/weather?timeRange=24h|7d|30d&city=...`

**Algoritmos Implementados:**

1. **Cálculo de Métricas Agregadas:**
   - Média de temperatura, umidade, vento e probabilidade de chuva
   - Temperatura mínima e máxima
   - Detecção de tendência (rising/falling/stable)

2. **Índice de Conforto Climático (0-100):**
   - **Temperatura:** Ideal 20-26°C = 100 pontos
   - **Umidade:** Ideal 40-70% = 100 pontos
   - **Vento:** Ideal 5-20 km/h = 100 pontos
   - Média ponderada dos três fatores

3. **Classificação do Clima:**
   - `agradavel` - Temperatura 20-26°C, umidade 40-70%
   - `moderado` - Temperatura 18-28°C
   - `quente` - Temperatura > 30°C
   - `frio` - Temperatura < 15°C
   - `chuvoso` - Probabilidade de chuva > 60%
   - `variado` - Demais casos

4. **Geração de Resumo em Linguagem Natural:**
   - Texto descritivo com métricas principais
   - Inclui tendência e classificação

5. **Alertas Automáticos:**
   - Calor extremo (> 32°C)
   - Frio intenso (< 12°C)
   - Alta probabilidade de chuva (> 70%)
   - Umidade muito alta (> 85%)
   - Ventos fortes (> 30 km/h)
   - Tendência de aumento com temperatura alta

**Exemplo de Resposta:**
```json
{
  "timeRange": "24h",
  "metrics": {
    "averageTemperature": 28.5,
    "averageHumidity": 0.75,
    "averageWindSpeed": 12.3,
    "averageRainProbability": 0.45,
    "minTemperature": 26.2,
    "maxTemperature": 31.1,
    "trend": "rising"
  },
  "classification": "quente",
  "comfortScore": 72,
  "summaryText": "No período analisado nas últimas 24 horas, observamos temperatura média de 28.5°C com tendência de aumento, caracterizando um clima quente. O índice de conforto está em 72/100.",
  "alerts": [
    "📈 Temperatura em alta - prepare-se para dias mais quentes"
  ]
}
```

#### 4.3. Módulo de Autenticação (`auth`)

**Endpoints:**
- `POST /api/auth/login` - Autenticação JWT

**Funcionalidades:**
- Geração de token JWT
- Validação de credenciais
- Guards para proteção de rotas

#### 4.4. Módulo de Usuários (`users`)

**Endpoints:**
- `GET /api/users` - Listar (com paginação)
- `GET /api/users/:id` - Buscar por ID
- `POST /api/users` - Criar (admin only)
- `PATCH /api/users/:id` - Atualizar
- `DELETE /api/users/:id` - Remover (admin only)

**Funcionalidades:**
- CRUD completo
- Criação automática de usuário admin na inicialização
- Roles (admin/user)
- Proteção por JWT Guard

#### 4.5. Módulo de API Externa (`external-api`)

**Endpoints:**
- `GET /api/external/pokemon` - Listar Pokémons (paginação)
- `GET /api/external/pokemon/:id` - Detalhes de um Pokémon

**Funcionalidades:**
- Integração com PokéAPI
- Paginação de resultados
- Cache básico (opcional)

---

### 5. Frontend React (`/frontend`)

**Responsabilidade:** Interface do usuário e visualização de dados

**Tecnologias:**
- React 18+
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui (componentes)

**Páginas Principais:**

#### 5.1. Dashboard (`/dashboard`)

**Componentes:**
- Cards de métricas principais (temperatura, umidade, vento, condição)
- Gráfico de linha (temperatura ao longo do tempo)
- Gráfico de barras (probabilidade de chuva)
- Tabela de registros históricos
- Seção de insights de IA
- Botões de exportação (CSV/XLSX)

**Fluxo de Dados:**
```
DashboardPage
    │
    ├─▶ useEffect (carregar dados)
    │   │
    │   ├─▶ weatherService.getLatest()
    │   │
    │   ├─▶ weatherService.getAll()
    │   │
    │   └─▶ insightsService.getInsights()
    │
    └─▶ Renderizar componentes
        │
        ├─▶ Cards (dados atuais)
        │
        ├─▶ Gráficos (dados históricos)
        │
        ├─▶ Tabela (registros)
        │
        └─▶ Insights (resumo e alertas)
```

#### 5.2. Página de Usuários (`/users`)

**Funcionalidades:**
- Listagem de usuários (tabela)
- Criação de novo usuário (dialog)
- Edição de usuário (dialog)
- Exclusão de usuário (confirmação)
- Paginação

#### 5.3. Página de Exploração (`/explorar`)

**Funcionalidades:**
- Listagem de Pokémons com paginação
- Detalhes de um Pokémon (modal ou página)
- Busca/filtros (se implementado)

#### 5.4. Página de Login (`/login`)

**Funcionalidades:**
- Formulário de autenticação
- Armazenamento de token no localStorage
- Redirecionamento para Dashboard após login

**Proteção de Rotas:**
- `ProtectedRoute` component
- Verificação de token JWT
- Redirecionamento para login se não autenticado

---

### 6. MongoDB

**Responsabilidade:** Armazenamento persistente de dados

**Coleções Principais:**
- `weather_logs` - Registros climáticos
- `users` - Usuários do sistema

**Configuração:**
- Autenticação habilitada
- Volume persistente via Docker
- Health checks configurados

---

## 🔐 Segurança

### Autenticação
- JWT tokens com expiração configurável (padrão: 24h)
- Guards em todas as rotas protegidas
- Validação de credenciais no login

### Validação
- DTOs com class-validator no NestJS
- Validação de tipos no TypeScript
- Validação de campos obrigatórios no worker Go

### Tratamento de Erros
- Try/catch em pontos críticos
- Logs de erro estruturados
- Mensagens de erro apropriadas para o usuário

---

## 📦 Infraestrutura (Docker Compose)

### Serviços

1. **mongo** - MongoDB 7
2. **rabbitmq** - RabbitMQ 3 (com Management UI)
3. **api** - NestJS (porta 3000)
4. **frontend** - React + Vite (porta 5173)
5. **collector-python** - Serviço de coleta
6. **worker-go** - Worker de processamento

### Rede
- Rede isolada: `gdash-network`
- Comunicação interna via nomes de serviços

### Volumes
- `mongo_data` - Persistência do MongoDB
- `rabbitmq_data` - Persistência do RabbitMQ

### Health Checks
- MongoDB e RabbitMQ têm health checks configurados
- Dependências entre serviços respeitam health checks

---

## 🔄 Fluxo Completo de uma Requisição

### Exemplo: Visualizar Dashboard

```
1. Usuário acessa /dashboard
   │
   ├─▶ ProtectedRoute verifica token
   │
   └─▶ DashboardPage carrega
       │
       ├─▶ GET /api/weather/logs/latest
       │   │
       │   ├─▶ JWT Guard valida token
       │   │
       │   ├─▶ WeatherController.findLatest()
       │   │
       │   ├─▶ WeatherService.findLatest()
       │   │
       │   ├─▶ MongoDB Query
       │   │
       │   └─▶ Retorna JSON
       │
       ├─▶ GET /api/weather/logs?limit=100
       │   │
       │   └─▶ (mesmo fluxo acima)
       │
       └─▶ GET /api/insights/weather?timeRange=24h
           │
           ├─▶ JWT Guard valida token
           │
           ├─▶ InsightsController.generate()
           │
           ├─▶ InsightsService.generateInsights()
           │   │
           │   ├─▶ WeatherService.getAggregatedData()
           │   │   │
           │   │   └─▶ MongoDB Aggregation
           │   │
           │   ├─▶ Calcular métricas
           │   │
           │   ├─▶ Calcular comfort score
           │   │
           │   ├─▶ Classificar clima
           │   │
           │   ├─▶ Gerar resumo
           │   │
           │   └─▶ Gerar alertas
           │
           └─▶ Retorna JSON com insights
```

---

## 🎯 Decisões de Arquitetura

### Por que RabbitMQ?
- Desacoplamento entre serviços
- Garantia de entrega
- Escalabilidade (múltiplos workers)
- Resiliência (mensagens não se perdem)

### Por que Go para o Worker?
- Performance no consumo de filas
- Simplicidade e baixo overhead
- Concorrência nativa
- Binário pequeno e rápido

### Por que NestJS?
- Estrutura modular e organizada
- TypeScript end-to-end
- Decorators e dependency injection
- Swagger integrado
- Fácil manutenção e escalabilidade

### Por que MongoDB?
- Flexibilidade no schema (dados climáticos podem variar)
- Performance em consultas por data
- Fácil agregação de dados
- JSON nativo

### Por que shadcn/ui?
- Componentes modernos e acessíveis
- Customizável (copia código, não dependência)
- Baseado em Radix UI
- Integração perfeita com Tailwind

---

## 📈 Escalabilidade

### Horizontal Scaling
- **Collector Python:** Múltiplas instâncias podem coletar de diferentes cidades
- **Worker Go:** Múltiplos workers podem consumir a mesma fila (load balancing automático)
- **API NestJS:** Pode ser escalada horizontalmente com load balancer
- **Frontend:** Pode ser servido via CDN

### Vertical Scaling
- Aumentar recursos de CPU/memória conforme necessário
- MongoDB pode usar replicação para leitura

### Otimizações
- Índices no MongoDB para consultas frequentes
- Cache de insights (se implementado)
- Paginação em todas as listagens
- Limite de exportação (10.000 registros)

---

## 🐛 Tratamento de Erros e Resiliência

### Collector Python
- Retry na publicação no RabbitMQ (3 tentativas)
- Logs de erro detalhados
- Continua rodando mesmo em caso de falha temporária

### Worker Go
- Retry no envio para API (3 tentativas com backoff)
- Validação de dados antes de processar
- ACK mesmo em caso de erro (evita loop infinito)
- Logs de todas as operações

### API NestJS
- Validação de DTOs
- Try/catch em operações críticas
- Respostas de erro padronizadas
- Health checks

### Frontend
- Tratamento de erros de API
- Loading states
- Mensagens de erro amigáveis
- Fallback para dados não disponíveis

---

## 📝 Logs e Monitoramento

### Logs por Serviço
- **Python:** Logs de coleta e publicação
- **Go:** Logs de consumo e envio
- **NestJS:** Logs de requisições e erros
- **Frontend:** Console logs (dev) e error boundaries

### O que Logar
- Operações bem-sucedidas (nível INFO)
- Erros e exceções (nível ERROR)
- Tentativas de retry
- Tempos de resposta (se implementado)

---

## 🚀 Deploy e Execução

### Desenvolvimento
```bash
docker compose up --build
```

### Produção
- Configurar variáveis de ambiente adequadas
- Usar secrets management
- Configurar SSL/TLS
- Monitoramento e alertas
- Backup do MongoDB

---

## 📚 Conclusão

Esta arquitetura demonstra:

✅ **Integração entre múltiplas tecnologias** (Python, Go, TypeScript)  
✅ **Pipeline completo de dados** (coleta → fila → processamento → armazenamento → visualização)  
✅ **Arquitetura escalável e resiliente**  
✅ **Boas práticas de desenvolvimento** (tipagem, validação, tratamento de erros)  
✅ **Experiência do usuário moderna** (dashboard interativo, insights de IA)  

O sistema está pronto para evoluir e adicionar novas funcionalidades mantendo a arquitetura limpa e organizada.

