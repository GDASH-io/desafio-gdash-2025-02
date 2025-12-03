# Arquitetura do Projeto GDASH

## Visão Geral

O projeto GDASH é uma aplicação de monitoramento climático composta por múltiplos serviços que trabalham em conjunto para coletar, processar e exibir dados meteorológicos.

## Componentes Principais

### 1. Frontend (React + Vite + Tailwind)

**Localização:** `frontend/`

**Tecnologias:**
- React 18
- Vite
- TypeScript
- Tailwind CSS
- Chart.js para visualizações
- React Router para navegação

**Arquitetura:**
- Componentes modulares organizados por funcionalidade
- Hooks customizados para lógica reutilizável
- Serviços para comunicação com API
- Utilitários compartilhados

**Estrutura:**
```
frontend/src/
  components/     # Componentes reutilizáveis
  hooks/          # Hooks customizados
  pages/          # Páginas da aplicação
  services/       # Serviços de API
  utils/          # Utilitários
```

### 2. Backend (NestJS + MongoDB)

**Localização:** `backend/`

**Tecnologias:**
- NestJS (Node.js framework)
- MongoDB com Mongoose
- JWT para autenticação
- Swagger para documentação de API
- ExcelJS para exportação

**Arquitetura:**
- Arquitetura modular baseada em módulos NestJS
- Separação de responsabilidades (Controllers, Services, DTOs)
- Validação de dados com class-validator
- Tratamento de erros centralizado
- Rate limiting para segurança

**Estrutura:**
```
backend/src/
  auth/           # Módulo de autenticação
  users/          # Módulo de usuários
  weather/        # Módulo de dados climáticos
    controllers/  # Controllers
    services/     # Serviços especializados
    dto/          # Data Transfer Objects
    schemas/      # Schemas Mongoose
    utils/        # Utilitários do módulo
  common/         # Código compartilhado
    exceptions/   # Exceções customizadas
    filters/      # Exception filters
    utils/        # Utilitários comuns
  config/         # Configurações
```

### 3. Collector (Python)

**Localização:** `collector-python/`

**Tecnologias:**
- Python 3.11+
- requests para HTTP
- pika para RabbitMQ

**Funcionalidade:**
- Coleta dados de APIs meteorológicas (Open-Meteo)
- Suporta dois modos:
  - **Direct**: Envia dados diretamente para o backend
  - **Rabbit**: Publica mensagens no RabbitMQ
- Retry automático em caso de falhas
- Configurável via variáveis de ambiente

### 4. Worker (Go)

**Localização:** `worker-go/`

**Tecnologias:**
- Go 1.20+
- AMQP (RabbitMQ client)

**Funcionalidade:**
- Consome mensagens do RabbitMQ
- Valida dados recebidos
- Envia dados validados para o backend
- Implementa retry com backoff exponencial
- Graceful shutdown

## Fluxo de Dados

```
┌─────────────┐
│  Collector  │───┐
│   (Python)  │   │
└─────────────┘   │
                  │
                  ▼
            ┌──────────┐
            │ RabbitMQ │
            └──────────┘
                  │
                  ▼
┌─────────────┐   │
│   Worker    │───┘
│    (Go)     │
└─────────────┘
      │
      ▼
┌─────────────┐
│   Backend   │◄──┐
│  (NestJS)   │   │
└─────────────┘   │
      │           │
      ▼           │
┌─────────────┐  │
│  MongoDB    │  │
└─────────────┘  │
                 │
      ┌──────────┘
      │
      ▼
┌─────────────┐
│  Frontend   │
│   (React)   │
└─────────────┘
```

## Decisões Arquiteturais

### Por que NestJS?

- Framework TypeScript robusto e bem documentado
- Arquitetura modular facilita manutenção
- Suporte nativo a decorators e dependency injection
- Excelente integração com MongoDB e JWT
- Swagger integrado para documentação de API

### Por que MongoDB?

- Schema flexível adequado para dados meteorológicos
- Boa performance para leitura de grandes volumes
- Fácil integração com NestJS via Mongoose
- Suporte a queries complexas e agregações

### Por que RabbitMQ?

- Desacoplamento entre collector e backend
- Garantia de entrega de mensagens
- Escalabilidade horizontal
- Suporte a diferentes padrões de mensageria

### Por que Microserviços?

- Separação de responsabilidades
- Escalabilidade independente
- Tecnologias adequadas para cada serviço
- Facilita manutenção e deploy independente

## Segurança

### Autenticação
- JWT tokens com expiração configurável
- Senhas hasheadas com bcrypt
- Política de senhas fortes

### Validação
- Validação de inputs em todas as camadas
- Sanitização de dados
- Rate limiting para prevenir abuso

### CORS
- Configuração restritiva de origens permitidas
- Headers e métodos específicos

## Testes

### Backend
- Testes unitários com Jest
- Testes de integração
- Cobertura mínima: 70%

### Frontend
- Testes unitários com Vitest
- Testes de componentes com Testing Library
- Cobertura mínima: 70%

## Deploy

### Desenvolvimento
- Docker Compose para orquestração local
- Hot reload em todos os serviços
- Variáveis de ambiente via `.env`

### Produção
- Containers Docker individuais
- Orquestração via Docker Compose ou Kubernetes
- Health checks configurados
- Logs centralizados

## Monitoramento

- Health checks em todos os serviços
- Logging estruturado
- Tratamento de erros centralizado
- Métricas de performance (futuro)

## Próximos Passos

1. Implementar métricas e monitoramento
2. Adicionar cache (Redis)
3. Implementar filas de processamento assíncrono
4. Adicionar testes E2E completos
5. Implementar CI/CD completo

