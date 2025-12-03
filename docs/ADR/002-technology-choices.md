# ADR 002: Escolhas de Tecnologias

## Status

Aceito

## Contexto

Cada componente do sistema requer escolha de tecnologia adequada ao seu propósito.

## Decisões

### Frontend: React + Vite

**Razões:**
- React é maduro e amplamente usado
- Vite oferece desenvolvimento rápido
- TypeScript para type safety
- Tailwind CSS para estilização rápida

**Alternativas consideradas:**
- Vue.js: Menos popular no time
- Angular: Muito verboso para o escopo
- Svelte: Menos maduro

### Backend: NestJS

**Razões:**
- Framework TypeScript robusto
- Arquitetura modular
- Excelente integração com MongoDB e JWT
- Swagger integrado

**Alternativas consideradas:**
- Express: Muito baixo nível
- Fastify: Menos features out-of-the-box
- Django: Python não era preferência para backend

### Database: MongoDB

**Razões:**
- Schema flexível para dados meteorológicos
- Boa performance para leitura
- Fácil integração com NestJS
- Suporte a agregações complexas

**Alternativas consideradas:**
- PostgreSQL: Schema fixo seria limitante
- InfluxDB: Overkill para o escopo atual

### Collector: Python

**Razões:**
- Excelente para integração com APIs
- Bibliotecas maduras (requests, pika)
- Fácil de manter e debugar

**Alternativas consideradas:**
- Node.js: Já usado no backend, diversidade de stack
- Go: Mais verboso para integrações HTTP

### Worker: Go

**Razões:**
- Performance excelente
- Concorrência nativa
- Binário único fácil de deploy
- Ideal para processamento de filas

**Alternativas consideradas:**
- Node.js: Performance inferior para I/O intensivo
- Python: GIL limita concorrência

### Message Queue: RabbitMQ

**Razões:**
- Maduro e estável
- Suporte a múltiplos protocolos
- Garantia de entrega
- Interface de gerenciamento

**Alternativas consideradas:**
- Redis Pub/Sub: Menos garantias de entrega
- Apache Kafka: Overkill para o escopo

## Consequências

### Positivas
- Stack moderna e produtiva
- Boa documentação disponível
- Comunidade ativa

### Negativas
- Diversidade de linguagens aumenta curva de aprendizado
- Requer conhecimento em múltiplas tecnologias

## Data

2025-01-24

