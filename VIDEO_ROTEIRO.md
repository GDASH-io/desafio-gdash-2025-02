# 🎥 Roteiro do Vídeo Explicativo - Desafio GDASH 2025/02

**Duração máxima: 5 minutos**

---

## 📋 Estrutura do Vídeo

### 1. Introdução (30 segundos)

**O que falar:**
- Apresentação rápida: "Olá, meu nome é [SEU NOME] e este é o vídeo explicativo do desafio técnico GDASH 2025/02"
- Objetivo: "Vou apresentar a arquitetura e o funcionamento do sistema full-stack que desenvolvi para coletar, processar e exibir dados climáticos em tempo real"

**O que mostrar:**
- Tela inicial do projeto (README ou estrutura de pastas)
- Docker Compose rodando (`docker compose ps`)

---

### 2. Visão Geral da Arquitetura (1 minuto)

**O que falar:**
- "O sistema implementa um pipeline completo de dados, integrando múltiplas tecnologias"
- "O fluxo principal é: Python coleta dados → RabbitMQ → Worker Go → API NestJS → MongoDB → Frontend React"

**O que mostrar:**
- Diagrama/fluxograma da arquitetura (pode ser um slide ou desenho)
- Ou mostrar o `docker-compose.yml` destacando os serviços

**Componentes principais:**
1. **Collector Python** - Coleta dados climáticos periodicamente
2. **RabbitMQ** - Fila de mensagens
3. **Worker Go** - Processa mensagens e envia para API
4. **API NestJS** - Backend com MongoDB
5. **Frontend React** - Dashboard e interface do usuário

---

### 3. Pipeline de Dados - Fluxo Completo (1 minuto e 30 segundos)

#### 3.1. Coleta de Dados (Python → RabbitMQ) (30 segundos)

**O que falar:**
- "O serviço Python roda em loop, coletando dados da API Open-Meteo a cada 1 hora"
- "Os dados são normalizados e enviados para a fila RabbitMQ em formato JSON"
- "Inclui temperatura, umidade, velocidade do vento, condição do céu e probabilidade de chuva"

**O que mostrar:**
- Código do `collector-python/main.py` (função `fetch_weather_data` e `publish_to_rabbitmq`)
- Logs do container Python mostrando coleta bem-sucedida
- RabbitMQ Management UI mostrando mensagens na fila

#### 3.2. Processamento (RabbitMQ → Go → NestJS) (30 segundos)

**O que falar:**
- "O worker Go consome mensagens do RabbitMQ de forma assíncrona"
- "Valida os dados e envia para a API NestJS via HTTP POST"
- "Implementa retry automático em caso de falha e confirmação de mensagens (ack/nack)"

**O que mostrar:**
- Código do `worker-go/main.go` (função `processMessage` e `sendToAPI`)
- Logs do worker mostrando processamento de mensagens
- Logs da API NestJS recebendo dados

#### 3.3. Armazenamento (NestJS → MongoDB) (30 segundos)

**O que falar:**
- "A API NestJS recebe os dados no endpoint `POST /api/weather/logs`"
- "Os dados são validados usando DTOs e armazenados no MongoDB"
- "O schema inclui índices para otimizar consultas por data e cidade"

**O que mostrar:**
- Código do `weather.controller.ts` e `weather.service.ts`
- Schema do MongoDB (`weather-log.schema.ts`)
- Swagger mostrando o endpoint de ingestão

---

### 4. Funcionalidades do Backend (1 minuto)

#### 4.1. Autenticação e Usuários (20 segundos)

**O que falar:**
- "Implementei autenticação JWT e CRUD completo de usuários"
- "Um usuário admin é criado automaticamente na inicialização"
- "Todas as rotas (exceto login e ingestão) requerem autenticação"

**O que mostrar:**
- Swagger mostrando endpoints de auth e users
- Código do `auth.service.ts` ou `users.controller.ts`

#### 4.2. Insights de IA (20 segundos)

**O que falar:**
- "O sistema gera insights inteligentes a partir dos dados históricos"
- "Calcula médias, tendências, índice de conforto climático (0-100) e classifica o clima"
- "Gera resumos em linguagem natural e alertas baseados em condições extremas"

**O que mostrar:**
- Código do `insights.service.ts` (funções de cálculo)
- Exemplo de resposta de insights no Swagger ou Postman
- Explicar brevemente as fórmulas de conforto climático

#### 4.3. Exportação e API Externa (20 segundos)

**O que falar:**
- "Implementei exportação de dados em CSV e XLSX"
- "Integração opcional com PokéAPI para demonstração de consumo de API pública paginada"

**O que mostrar:**
- Endpoints de exportação no Swagger
- Código do `export.service.ts` (se houver tempo)

---

### 5. Frontend e Dashboard (1 minuto)

**O que falar:**
- "O frontend foi construído com React, Vite, Tailwind CSS e componentes shadcn/ui"
- "O Dashboard exibe dados climáticos em tempo real com gráficos e cards informativos"
- "Mostra insights de IA, tabela de registros históricos e permite exportação de dados"

**O que mostrar:**
- Dashboard rodando no navegador
- Gráficos de temperatura ao longo do tempo
- Cards com métricas principais (temperatura, umidade, vento)
- Seção de insights com resumo e alertas
- Botões de exportação CSV/XLSX funcionando
- Página de usuários (CRUD)
- Página opcional de Pokémons (se implementada)

**Demonstração rápida:**
- Login com usuário admin
- Navegação pelo Dashboard
- Visualização de gráficos
- Exportação de dados

---

### 6. Docker Compose e Execução (30 segundos)

**O que falar:**
- "Toda a solução roda via Docker Compose com um único comando"
- "Todos os serviços estão configurados com health checks e dependências"
- "O sistema é totalmente containerizado e pronto para deploy"

**O que mostrar:**
- Comando `docker compose up --build`
- `docker compose ps` mostrando todos os containers rodando
- Logs de inicialização dos serviços

---

### 7. Principais Decisões Técnicas (30 segundos)

**O que falar:**
- "Escolhi RabbitMQ para desacoplar a coleta do processamento, permitindo escalabilidade"
- "Go para o worker pela performance e simplicidade no consumo de filas"
- "NestJS pela estrutura modular e TypeScript end-to-end"
- "MongoDB para flexibilidade no schema de dados climáticos"
- "shadcn/ui para componentes modernos e acessíveis no frontend"

**O que mostrar:**
- Pode ser apenas narração, sem código

---

### 8. Conclusão (30 segundos)

**O que falar:**
- "O sistema demonstra integração entre múltiplas linguagens e serviços"
- "Pipeline completo de dados com tratamento de erros, retry e logs"
- "Dashboard funcional com visualizações e insights baseados em IA"
- "Código organizado, tipado e seguindo boas práticas"

**O que mostrar:**
- Visão geral final do sistema rodando
- Links importantes (Swagger, Frontend, etc.)

---

## 🎬 Dicas para Gravação

### Preparação
- [ ] Ter todos os serviços rodando via Docker Compose
- [ ] Ter dados coletados (pelo menos algumas horas de dados)
- [ ] Ter o Swagger aberto e funcionando
- [ ] Ter o frontend aberto e logado
- [ ] Preparar slides/diagramas se necessário

### Durante a Gravação
- Fale de forma clara e pausada
- Use zoom para destacar código importante
- Mostre logs em tempo real quando possível
- Demonstre funcionalidades, não apenas explique
- Mantenha o ritmo - 5 minutos passam rápido!

### Pós-Produção
- Adicione legendas/legendas se necessário
- Corte pausas longas
- Adicione transições suaves entre seções
- Verifique se o áudio está claro

---

## ⏱️ Controle de Tempo Sugerido

| Seção | Tempo |
|-------|-------|
| 1. Introdução | 0:30 |
| 2. Visão Geral | 1:00 |
| 3. Pipeline de Dados | 1:30 |
| 4. Funcionalidades Backend | 1:00 |
| 5. Frontend e Dashboard | 1:00 |
| 6. Docker Compose | 0:30 |
| 7. Decisões Técnicas | 0:30 |
| 8. Conclusão | 0:30 |
| **TOTAL** | **~6:30** |

> ⚠️ **Nota**: O tempo total está um pouco acima de 5 minutos. Ajuste conforme necessário, priorizando as seções mais importantes (Pipeline de Dados e Dashboard).

---

## 📝 Checklist Pré-Gravação

- [ ] Todos os serviços estão rodando
- [ ] Dados climáticos foram coletados (pelo menos 3-5 registros)
- [ ] Usuário admin está criado e funcionando
- [ ] Dashboard está exibindo dados
- [ ] Swagger está acessível
- [ ] Exportação CSV/XLSX está funcionando
- [ ] Insights estão sendo gerados
- [ ] Código está organizado e comentado (se for mostrar)
- [ ] Diagrama/fluxograma está pronto (se for usar)

---

**Boa gravação! 🎬**

