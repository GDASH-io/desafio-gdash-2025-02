# Documentação Técnica - Desafio GDash 2025-02

## 📋 Visão Geral

Aplicação de monitoramento de dados climáticos construída com arquitetura de monolito modular. O sistema coleta dados meteorológicos, processa-os através de uma fila de mensagens e disponibiliza visualizações através de uma interface web moderna.

## 🛠️ Stack Tecnológica

### Frontend

- **React 19.2.0** - Biblioteca JavaScript para construção de interfaces
- **TypeScript 5.9.3** - Tipagem estática para JavaScript
- **Vite 7.2.4** - Build tool e dev server de alta performance
- **Tailwind CSS 4.1.17** - Framework CSS utility-first
- **shadcn/ui** - Componentes UI acessíveis e customizáveis baseados em Radix UI
- **Redux Toolkit 2.2.7** - Gerenciamento de estado global
- **RTK Query** - Cache e sincronização de dados do servidor
- **React Router DOM 7.9.6** - Roteamento client-side
- **React Hook Form 7.66.1** - Gerenciamento de formulários
- **Zod 4.1.13** - Validação de schemas TypeScript-first
- **Sonner 2.0.7** - Sistema de notificações toast

### Backend

- **NestJS 11.0.1** - Framework Node.js progressivo para aplicações server-side
- **TypeScript 5.7.3** - Linguagem de programação
- **MongoDB** - Banco de dados NoSQL
- **Mongoose 8.20.0** - ODM (Object Document Mapper) para MongoDB
- **Passport.js** - Middleware de autenticação
- **JWT (JSON Web Tokens)** - Autenticação stateless
- **bcrypt 6.0.0** - Hash de senhas
- **Helmet 8.1.0** - Segurança HTTP headers
- **Throttler 6.4.0** - Rate limiting
- **Swagger/OpenAPI** - Documentação de API
- **Zod 4.1.12** - Validação de dados
- **Cookie Parser** - Parsing de cookies HTTP

### Infraestrutura e Mensageria

- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers
- **RabbitMQ 3-management** - Message broker para comunicação assíncrona

### Serviços Auxiliares

- **Python Producer** - Coleta de dados climáticos

  - Python 3.x
  - pika - Cliente RabbitMQ
  - requests - Cliente HTTP
  - unidecode - Normalização de texto

- **Go Worker** - Processamento de mensagens
  - Go 1.21
  - amqp091-go - Cliente RabbitMQ

## 🏗️ Arquitetura

### Diagrama de Componentes

```
┌─────────────┐
│   Frontend  │  React + Vite + Tailwind + Redux Toolkit
│  (Port 3000)│
└──────┬──────┘
       │ HTTP/REST
       ▼
┌─────────────┐
│  NestJS API │  Backend Principal (MongoDB)
│  (Port 3001)│
└──────┬──────┘
       │ HTTP/REST
       ▲
       │
┌──────┴──────┐
│ Go Worker   │  Consome RabbitMQ e envia para NestJS
│             │
└──────┬──────┘
       │ Consome
       ▼
┌─────────────┐
│  RabbitMQ   │  Message Broker
│  (Port 5672)│
└──────┬──────┘
       │ Publica
       ▲
       │
┌──────┴──────┐
│Python       │  Coleta dados climáticos e publica no RabbitMQ
│Producer     │
└─────────────┘
```

### Fluxo de Dados

1. **Coleta**: O `python-producer` coleta dados meteorológicos de APIs externas
2. **Publicação**: Dados são publicados no RabbitMQ
3. **Processamento**: O `go-worker` consome mensagens do RabbitMQ
4. **Armazenamento**: Worker envia dados processados para a API NestJS via HTTP
5. **Visualização**: Frontend React consome a API NestJS para exibir dados

## 📱 Frontend

### Estrutura

```
frontend/
├── src/
│   ├── app/              # Configuração Redux e providers
│   ├── components/       # Componentes reutilizáveis (shadcn/ui)
│   ├── modules/          # Módulos da aplicação (auth, weather)
│   ├── pages/            # Páginas/rotas da aplicação
│   ├── styles/           # Estilos globais
│   └── lib/              # Utilitários
```

### Gerenciamento de Estado com Redux Toolkit

O projeto utiliza **Redux Toolkit** com **RTK Query** para gerenciamento de estado e cache de dados:

```typescript
// store.ts
export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [weatherApi.reducerPath]: weatherApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, weatherApi.middleware),
});
```

#### Cache com RTK Query

RTK Query fornece cache automático e invalidação inteligente:

- **Cache automático**: Dados são armazenados em cache após primeira requisição
- **Tag-based invalidation**: Sistema de tags para invalidar cache relacionado
- **Refetch automático**: Revalidação automática em intervalos configuráveis
- **Deduplicação**: Múltiplas requisições idênticas são deduplicadas

**Exemplo de uso:**

```typescript
// weather/api.ts
export const weatherApi = createApi({
  reducerPath: "weatherApi",
  baseQuery: basequery,
  tagTypes: ["Weather"],
  endpoints: (builder) => ({
    getWeather: builder.query<PaginatedWeatherResponse, WeatherFilters>({
      query: (filters) => ({ url: `/weather?${params}`, method: "GET" }),
      providesTags: ["Weather"], // Tag para invalidação
    }),
  }),
});
```

**Benefícios para escalabilidade:**

- Reduz requisições desnecessárias ao servidor
- Melhora performance da aplicação
- Facilita sincronização de dados entre componentes
- Suporta otimistic updates e background refetch

### Componentes UI

Utiliza **shadcn/ui** para componentes acessíveis e customizáveis:

- Button, Card, Input, Label, Select, Table, Toast
- Design system consistente

### Roteamento

React Router DOM para navegação client-side com rotas protegidas.

## 🔧 Backend

### Estrutura

```
backend/
├── src/
│   ├── auth/             # Autenticação e autorização
│   ├── users/            # Gerenciamento de usuários
│   ├── weather/          # Módulo de dados climáticos
│   ├── health/           # Health checks
│   ├── database/         # Configuração MongoDB
│   └── utils/            # Utilitários (helmet, swagger, etc)
```

### Banco de Dados

**MongoDB** com **Mongoose**:

- Schemas tipados com TypeScript
- Validação de dados no nível do schema
- Índices para otimização de queries
- Relacionamentos entre documentos

### Autenticação e Autorização

- **JWT (JSON Web Tokens)** para autenticação stateless
- **Passport.js** com estratégia JWT
- **Guards** do NestJS para proteção de rotas
- **Roles** (USER, ADMIN) para controle de acesso
- Senhas hasheadas com **bcrypt**

### Segurança

#### Helmet.js

Configuração de headers de segurança HTTP:

- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

#### Rate Limiting

Throttler do NestJS para prevenir abuso:

- Limite de 10 requisições por minuto por IP
- Proteção contra DDoS e brute force

#### Validação de Dados

- **Zod** para validação de schemas
- DTOs (Data Transfer Objects) para validação de entrada
- Sanitização de dados de entrada

#### CORS

Configuração restritiva de CORS:

- Origins permitidos apenas em desenvolvimento
- Credenciais habilitadas para cookies
- Métodos HTTP específicos

### Documentação da API

**Swagger/OpenAPI** integrado:

- Documentação interativa disponível em `/api/docs`
- Schemas de request/response
- Exemplos de uso

## 🧪 Testes

### Backend

Testes unitários e de integração com **Jest**:

```bash
cd backend
npm run test          # Executa todos os testes
npm run test:watch    # Modo watch
npm run test:cov      # Com cobertura de código
npm run test:e2e      # Testes end-to-end
```

**Cobertura de testes:**

- Services (AuthService, UsersService, WeatherService)
- Controllers (AuthController, UsersController, WeatherController)
- Guards e estratégias de autenticação

**Exemplo de teste:**

```typescript
describe("AuthService", () => {
  it("should return access token on successful login", async () => {
    // Arrange
    usersService.findUserByEmail.mockResolvedValue(mockUser);
    jwtService.sign.mockReturnValue("jwt-token");

    // Act
    const result = await service.login("test@example.com", "password123");

    // Assert
    expect(result.access_token).toBe("jwt-token");
  });
});
```

### Frontend

Estrutura preparada para testes com React Testing Library (configuração pode ser adicionada).

## 🔐 Boas Práticas de Segurança

### Implementadas

1. **Autenticação JWT**

   - Tokens com expiração
   - Refresh tokens (se implementado)
   - Armazenamento seguro em cookies httpOnly

2. **Hash de Senhas**

   - bcrypt com salt rounds
   - Nunca armazenar senhas em texto plano

3. **Validação de Entrada**

   - Validação em múltiplas camadas (DTO, Schema, Service)
   - Sanitização de dados
   - Proteção contra SQL/NoSQL injection

4. **Headers de Segurança**

   - Helmet.js configurado
   - CSP, HSTS, X-Frame-Options

5. **Rate Limiting**

   - Proteção contra brute force
   - Limite de requisições por IP

6. **CORS Restritivo**
   - Apenas origins permitidos
   - Métodos HTTP específicos

### Recomendações para Produção

- Implementar HTTPS obrigatório
- Adicionar logging e monitoramento
- Implementar WAF (Web Application Firewall)
- Revisão periódica de dependências (npm audit)
- Secrets management (ex: AWS Secrets Manager, HashiCorp Vault)

## 📊 Cache e Performance

### Frontend - RTK Query

**Cache automático:**

- Dados são cacheados automaticamente após primeira requisição
- Reduz requisições redundantes ao servidor
- Melhora tempo de resposta da UI

**Invalidação inteligente:**

- Sistema de tags para relacionar dados
- Invalidação seletiva quando dados são atualizados
- Refetch automático em background

### Backend

**Otimizações implementadas:**

- Índices no MongoDB para queries frequentes
- Paginação de resultados
- Projeção de campos (select apenas campos necessários)

**Recomendações:**

- Implementar cache Redis para queries frequentes
- Cache de estatísticas agregadas
- Connection pooling otimizado

## 🐍 Python Producer

Serviço responsável por coletar dados climáticos de APIs externas e publicar no RabbitMQ.

**Tecnologias:**

- Python 3.x
- pika (cliente RabbitMQ)
- requests (HTTP client)
- unidecode (normalização de texto)

**Funcionalidades:**

- Coleta periódica de dados
- Tratamento de erros e retry
- Formatação padronizada de mensagens

## 🚀 Go Worker

Worker de alta performance que consome mensagens do RabbitMQ e envia para a API NestJS.

**Tecnologias:**

- Go 1.21
- amqp091-go (cliente RabbitMQ)
- net/http (cliente HTTP)

**Características:**

- Alta performance e baixo consumo de memória
- Processamento concorrente com goroutines
- Acknowledgment de mensagens processadas
- Retry logic e tratamento de falhas

## 🐰 RabbitMQ

Message broker para comunicação assíncrona entre serviços.

**Configuração:**

- Exchange e queues configuradas
- Dead-letter queues para mensagens com falha
- Persistência de mensagens
- Management UI disponível na porta 15672

## 📸 Screenshots

### Interface de Dados Climáticos Paginados

![Dados Climáticos Paginados](./docs/paginated-weathers.png)

Visualização de dados climáticos com paginação, permitindo navegação eficiente através de grandes volumes de dados.

### Interface Mobile

![Interface Mobile](./docs/mobile-weathers.png)

Design responsivo otimizado para dispositivos móveis, garantindo experiência consistente em todas as plataformas.

### Estado Vazio

![Estado Vazio](./docs/empty-weather-data.png)

Interface amigável quando não há dados disponíveis, com mensagens claras e ações sugeridas.

## 🚀 Como Executar

### Pré-requisitos

- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento local)
- Python 3.x (para desenvolvimento local)
- Go 1.21+ (para desenvolvimento local)

### Desenvolvimento com Docker

```bash
# Iniciar todos os serviços
docker-compose -f docker-compose.dev.yml up -d

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Parar serviços
docker-compose -f docker-compose.dev.yml down
```

### Desenvolvimento Local

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Backend

```bash
cd backend
npm install
npm run start:dev
```

#### Python Producer

```bash
cd python-producer
pip install -r requirements.txt
python src/main.py
```

#### Go Worker

```bash
cd go-worker
go mod download
go run main.go
```

## 📝 Variáveis de Ambiente

Principais variáveis (ver `.env.example`):

```env
# Database
DATABASE_URI=mongodb://user:password@localhost:27017
DATABASE_NAME=weatherdb

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_QUEUE=weather-queue
RABBITMQ_EXCHANGE=weather-exchange

# API
BACKEND_PORT=3001
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:3001/api

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
```

## 🔄 Próximos Passos e Melhorias

### Frontend

- [ ] Testes unitários e de integração

### Backend

- [ ] Cache Redis para queries frequentes
- [ ] Logging estruturado (Winston/Pino)
- [ ] Testes de carga e performance

### Infraestrutura

- [ ] CI/CD pipeline completo
- [ ] Deploy automatizado
- [ ] Backup automatizado do banco
- [ ] Load balancing

## 📚 Referências

- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [RTK Query Documentation](https://redux-toolkit.js.org/rtk-query/overview)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)

---

**Desenvolvido por:** Vinicius dos Santos de Souza
