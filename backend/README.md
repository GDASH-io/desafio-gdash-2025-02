# 🌤️ Backend - Monitoramento Climático & Gestão

API robusta construída com **NestJS**, seguindo arquitetura modular e padrões de projeto sólidos para suportar uma aplicação de monitoramento climático com IA.

## 🛠️ Stack Tecnológica

- **Framework:** NestJS (Node.js)
- **Database:** MongoDB (via Mongoose)
- **Autenticação:** Passport.js + JWT (JSON Web Tokens)
- **IA Generativa:** Google Gemini 2.5 Flash (via `@google/generative-ai`)
- **Cache:** Cache Manager (In-Memory)
- **System Logs:** Log personalizado via interceptor com salvamento no Mongo - Retenção de 7 dias
- **Testes:** Jest (Unitários & Mocks)
- **Documentação:** Swagger (OpenAPI)
- **Validação:** Class-validator & Class-transformer

## 🏗️ Arquitetura e Padrões

O projeto segue uma arquitetura modular com **Repository Pattern** para desacoplamento do banco de dados.

### Estrutura de Pastas (Exemplo Modular)

```
src/
├── auth/                       # Módulo de Autenticação e Segurança
│   ├── dto/                    # Validação de dados de entrada (Login, Register)
│   ├── strategies/             # Estratégias de autenticação (ex: JWT, Local Strategy)
│   ├── auth.controller.ts      # Rotas de autenticação
│   └── ...
├── common/                     # Recursos compartilhados globalmente
│   ├── middleware/             # Interceptadores de requisição - Salvamento do Log do sistema no Mongo
│   └── schemas/                # Schemas de dados compartilhados
├── star-wars/                  # Módulo de Integração Star Wars
│   ├── star-wars.service.ts    # Lógica de negócio / Chamadas de API externa
│   └── ...
├── users/                      # Módulo de Gestão de Usuários
│   ├── dto/                    # DTOs para CreateUser, UpdateUser
│   ├── entities/               # Definição das entidades do Banco de Dados
│   ├── repositories/           # Abstração de acesso ao banco (Repository Pattern)
│   └── ...
├── weather/                    # Módulo de Clima (Domínio Principal)
│   ├── dto/                    # DTOs relacionados a previsão/clima
│   ├── entities/               # Entidades de Clima
│   ├── repositories/           # Implementação do Repository Pattern
│   │   ├── weather.mongo.repository.ts      # Implementação concreta (MongoDB)
│   │   └── weather.repository.interface.ts  # Contrato da interface (DIP)
│   └── ...
└── app.module.ts               # Módulo raiz (Orquestrador da aplicação)


```

### Destaques da Implementação

1.  **Repository Pattern:**
    - Os _Services_ não dependem diretamente do Mongoose (`Model<T>`).
    - Dependem de interfaces (`IUsersRepository`, `IWeatherRepository`).
    - Facilita testes e troca futura de banco de dados (ex: MongoDB -> PostgreSQL).

2.  **Estratégia de Cache (Cache-Aside):**
    - **Leitura Rápida:** Rotas `GET` (listagens, insights) são cacheadas na memória (TTL configurável).
    - **Invalidação Inteligente:** Sempre que um dado é criado (`POST`), atualizado (`PATCH`) ou deletado (`DELETE`), o cache do módulo é invalidado (`.clear()`) para garantir consistência imediata.

3.  **Inteligência Artificial (Gemini):**
    - Analisa os últimos 10 registros climáticos.
    - Gera insights de texto, alertas e **previsões numéricas** para a próxima hora.
    - Retorna JSON estruturado garantido via prompt engineering.
4.  **Middleware (System Log)**
    - Interceptação Inicial: Ao receber a requisição, ele captura instantaneamente o ip, o método HTTP (GET, POST, etc.) e a URL original.
    - Cálculo de Latência: Armazena o timestamp de início (start) para calcular o tempo de resposta.
    - Evento on('finish'): O middleware anexa um ouvinte ao evento finish da resposta. Isso garante que o log só seja gerado após o servidor terminar de processar tudo e devolver o status code ao cliente.
    - Contexto de Usuário: Se a rota for protegida (via JWT Guard), ele extrai os dados do usuário anexados ao objeto req['user']. Se for uma rota pública, esses campos são gravados como null.
    - Política de Retenção: A collection possui um índice TTL (Time-To-Live) configurado para 7 dias. Logs mais antigos que esse período são removidos automaticamente pelo banco de dados para economizar armazenamento.

## 🧪 Testes e Qualidade

O projeto possui uma suíte de testes unitários robusta utilizando **Jest**. A estratégia foca no isolamento total da lógica de negócio.

### Estratégia de Mocks

Os testes não dependem de banco de dados real nem de APIs externas. Todas as dependências são mockadas:

- **Repositórios:** `mockUsersRepository`, `mockWeatherRepository` simulam o banco.
- **Cache:** `mockCacheManager` verifica se o `.clear()` é chamado corretamente.
- **Config:** `mockConfigService` fornece chaves de API falsas para teste.
- **External APIs:** `global.fetch` é mockado para testar o módulo Star Wars sem internet.

### Cobertura dos Serviços

1.  **`UsersService`:** Valida hash de senha (bcrypt), unicidade de e-mail e regras de criação de admin.
2.  **`WeatherService`:** Testa a transformação de dados, integração simulada com IA e geração de CSV.
3.  **`AuthService`:** Garante que a validação de senha e emissão de JWT estão corretas.
4.  **`StarWarsService`:** Valida o tratamento de erros HTTP e paginação da API externa.

### Comandos de Teste

```
# Rodar todos os testes
npm run test

# Modo "Watch" (Desenvolvimento)
npm run test:watch

# Relatório de Cobertura (Coverage)
npm run test:cov

```

## 🚀 Módulos Principais

### 1. Auth Module

- Login seguro com comparação de hash (bcrypt).
- Emissão de Token JWT com Payloads customizados (`sub`, `role`).

### 2. Users Module (CRUD)

- Criação de usuários (Admin/User).
- Listagem e Edição.
- **Regra de Negócio:** Impede duplicação de e-mail e garante hash de senha antes de salvar.

### 3. Weather Module

- **Ingestão:** Recebe dados de coletores externos (Go/Python).
- **Análise:** Endpoint `/insights` consome a API do Gemini.
- **Exportação:** Gera relatórios `.csv` e `.xlsx` sob demanda usando Streams.

### 4. Star Wars Module

- Proxy para a SWAPI (Star Wars API).
- Encapsula a lógica de fetch externa para evitar CORS no frontend.

## 📦 Como Rodar

1.  Configure o `.env`:

    ```
    PORT=3000
    MONGO_URI=mongodb://localhost:27017/gdash
    RABBITMQ_URI=amqp://user:password@rabbitmq:5672
    JWT_SECRET=seu_segredo_super_secreto
    GEMINI_API_KEY=sua_chave_do_google_ai_studio # A API_KEY do Gemini costuma ser invalidada com frequência pela busca do Google de keys expostas. Caso isso ocorra, gere sua propria e coloque nesse .env pelo site https://aistudio.google.com/app/api-keys
    DEFAULT_ADMIN_EMAIL=admin@gdash.com
    DEFAULT_ADMIN_PASSWORD=admin1234

    #Gemini Key utilizada nesse projeto:AIzaSyApp6ZFuZQgQbENrT_hri_Q8VBpFA9kdz0


    ```
