# 🚀 Teste Técnico (Go, Python, NestJS, React)

Este guia cobre a implantação da aplicação utilizando **Docker Compose** e **Nginx (Proxy Reverso)** em uma VPS Linux (Ubuntu/Debian). Além disso, serve como referencia téncinca para o que foi desenvolvido.

Link do vídeo: https://www.youtube.com/watch?v=9LXGrFh_XL8
Link da aplicação no Google Cloud : copie e cole no navegador http://34.122.109.191

---

## 0. Instalação do Docker (VPS Nova) Se a sua VPS acabou de ser criada, rode estes comandos para instalar o Docker Engine e o Plugin do Compose atualizados.

    # 1. Atualize os pacotes do sistema sudo apt update && sudo apt upgrade -y
    # 2. Instale o Docker usando o script oficial de conveniência curl -fsSL [https://get.docker.com](https://get.docker.com) -o get-docker.sh sudo sh get-docker.sh
    # 3. Adicione seu usuário ao grupo do Docker (Para não precisar usar 'sudo' sempre) sudo usermod -aG docker $USER
    # 4. Ative as alterações de grupo (Ou deslogue e logue novamente) newgrp docker
    # 5. Teste se instalou corretamente docker compose version # Deve retornar algo como: Docker Compose version v2.x.x

## 1. Estrutura de Pastas Necessária

Certifique-se de que sua VPS tenha esta estrutura exata:

     /seu-projeto
    ├── docker-compose.yml
    ├── nginx/
    │   └── nginx.conf          (Proxy Principal)
    ├── backend/
    │   ├── Dockerfile
    │   └── .env
    ├── frontend/
    │   ├── Dockerfile          (Multi-Stage: Node -> Nginx)
    │   ├── nginx-custom.conf   (Config interna do SPA)
    │   └── .env
    ├── collector/ ...
    └── worker/ ...

## 2. Configuração do Frontend

Para performance, não usamos o Vite Dev Server na VPS. Usamos um **Nginx interno** para servir os arquivos estáticos compilados.

    # Estágio 1: Build (Compilação)
    FROM node:20-alpine AS builder
    WORKDIR /app
    COPY package*.json ./
    RUN npm install
    COPY . .
    RUN npm run build

    # Estágio 2: Servidor Leve (Produção)
    FROM nginx:alpine
    RUN rm /etc/nginx/conf.d/default.conf
    COPY --from=builder /app/dist /usr/share/nginx/html
    COPY nginx-custom.conf /etc/nginx/conf.d/default.conf
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]

📄 `frontend/nginx-custom.conf` (Crie este arquivo!)
Necessário para o React (SPA) não dar erro 404 ao atualizar a página.

    server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ /index.html;
    }

}

## 3. Configuração do Proxy Principal

O Proxy é quem recebe as requisições da internet. Arquivo: `nginx/nginx.conf`

        server {
    listen 80;
    server_name localhost;

    # Frontend (Agora aponta para a porta 80 interna)
    location / {
        proxy_pass http://frontend:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Backend (API)
    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

}

## 4. Orquestração (docker-compose.yml)

Versão final blindada. Apenas o Proxy tem porta aberta.

     version: '3.8'

    services:
      # --- Proxy Reverso (Porta de Entrada) ---
      nginx:
        image: nginx:alpine
        container_name: app_proxy
        restart: always
        ports:
          - "80:80" # ÚNICA porta aberta para o mundo
        volumes:
          - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf
        depends_on:
          - frontend
          - backend
        networks:
          - app_network

      # --- Aplicações ---

      frontend:
        build: ./frontend
        container_name: app_frontend
        restart: always
        # SEM PORTAS EXPOSTAS (O Proxy acessa internamente)
        env_file: ./frontend/.env
        networks: [app_network]

      backend:
        build: ./backend
        container_name: app_backend
        restart: always
        env_file: ./backend/.env
        depends_on: [mongo, rabbitmq]
        networks: [app_network]

      collector:
        build: ./collector
        container_name: app_collector
        restart: always
        env_file: ./collector/.env
        depends_on: [rabbitmq]
        networks: [app_network]

      worker:
        build: ./worker
        container_name: app_worker
        restart: always
        env_file: ./worker/.env
        depends_on: [rabbitmq, backend]
        networks: [app_network]

      # --- Infraestrutura (Banco e Fila) ---

      mongo:
        image: mongo:latest
        container_name: app_mongo
        restart: always
        volumes: [mongo_data:/data/db]
        networks: [app_network]

      rabbitmq:
        image: rabbitmq:3-management
        container_name: app_rabbitmq
        restart: always
        environment:
          - RABBITMQ_DEFAULT_USER=admin
          - RABBITMQ_DEFAULT_PASS=admin
        networks: [app_network]

    volumes:
      mongo_data:

    networks:
      app_network:
        driver: bridge

## 5. Variáveis de Ambiente

Crie os arquivos manualmente na VPS (`nano pasta/.env`).

**📄 `frontend/.env`**

     #Caminho relativo (o Proxy resolve)
     VITE_BACKEND_API_URL=/api/v1
     VITE_AUTO_REFRESH_INTERVAL=3600000 # 1 horas | ajuse conforme a necessidade em ms.

**📄 `backend/.env`**

    PORT=3000
    MONGO_URI=mongodb://mongo:27017/gdash
    RABBITMQ_URI=amqp://admin:admin@rabbitmq:5672
    GEMINI_API_KEY=SUA_CHAVE_AQUI #chave utilizada nesse projeto esta em env.txt dentro de ./backend
    # Admin Padrão - Usuario criado automaticamente ao startar a aplicação
    DEFAULT_ADMIN_EMAIL=admin@gdash.com
    DEFAULT_ADMIN_PASSWORD=admin1234

    # A API_KEY do Gemini costuma ser invalidada com frequência pela busca do Google de keys expostas. Caso isso ocorra, gere sua propria e coloque nesse .env pelo site https://aistudio.google.com/app/api-keys

**📄 worker/.env**

    RABBITMQ_URL=amqp://admin:admin@rabbitmq:5672/
    QUEUE_NAME=weather_data

**📄 `collector/.env`**

    LATITUDE=-16.4341
    LONGITUDE=-43.5154
    COLLECT_INTERVAL= 900 # 15 minutos | ajuste conforme necessidade em segundos.
    RABBITMQ_HOST=rabbitmq
    RABBITMQ_PORT=5672
    RABBITMQ_USER=admin
    RABBITMQ_PASS=admin
    QUEUE_NAME=weather_data

## 6. Operação e Firewall

### Firewall (Cloud)

Libere **APENAS**:

- TCP 80 (HTTP)
- TCP 443 (HTTPS)
- TCP 22 (SSH)

**Comandos Úteis**

    # Subir tudo (reconstruindo imagens)
    docker compose up -d --build

    # Ver logs
    docker compose logs -f

    # Limpar espaço em disco
    docker system prune -f

## 7. Acessando a Aplicação

Basta acessar `http://SEU_IP_DA_VPS` (sem porta).

A minha VPS econtra-se no seguinte IP: 34.122.109.191. **Não use https!**

## 8. Dica Extra

Se precisar acessar o MongoDB ou RabbitMQ visualmente, não abra as portas na nuvem! Use um **Túnel SSH** na sua máquina local: `ssh -L 27017:localhost:27017 usuario@ip-da-vps`

## 9. Opção de rodar localhost

**Certifique-se de ter o docker / docker compose instalado na sua máquina**

Se não quiser dar o deploy, dê o clone deste repositório entre na pasta e rode o seguinte comando "docker compose up -d --build". Assim que terminar, abra seu navegador e acesse o localhost. Configure as variaveis de ambiente conforme necessário. O proxy reverso do Nginix servirá os arquivos estáticos do React na porta 80.

# 🖥️ Frontend - Dashboard Climático & Gestão

Interface moderna, responsiva e de alto desempenho construída com **React 18+**, focada na visualização de dados em tempo real e numa experiência de utilizador fluida.

## 🎨 Stack Tecnológica

- **Core:** React 18+ (Vite)
- **Linguagem:** TypeScript
- **Estilização:** TailwindCSS v4
- **Componentes UI:** Shadcn/ui (Radix Primitives)
- **Gráficos:** Recharts
- **Ícones:** Lucide React
- **HTTP Client:** Axios (com Interceptors)
- **Feedback:** Sonner (Toasts)
- **Gestão de Formulários:** React Hook Form + Zod

## 🧩 Arquitetura do Frontend

O projeto utiliza o padrão de **Custom Hooks** para separar completamente a lógica de negócio da camada de apresentação (View/JSX).

### Estrutura de Diretórios

```
src/
├── components/
│   ├── ui/             # Componentes base do Shadcn (Button, Card, Input...)
│   └── ...
├── layouts/            # Layouts globais (MainLayout com Sidebar e Header)
├── lib/                # Configurações globais (Axios instance, Utils)
├── pages/
│   ├── Dashboard/
│   │   ├── components/ # Componentes exclusivos (Charts, Tables, Cards)
│   │   ├── hooks/      # useDashboard.ts (Toda a lógica e estado)
│   │   └── Dashboard.tsx (Apenas JSX/Visual)
│   ├── Users/
│   │   ├── components/ # Modais e Tabelas modulares
│   │   ├── hooks/      # useUsers.ts (Lógica de CRUD e Filtros)
│   │   └── UsersManager.tsx
│   ├── StarWars/       # Integração com API externa
│   │   └── ...
│   └── Login/
└── services/           # Camada de API (Axios calls para o Backend NestJS)

```

## ✨ Funcionalidades Principais

### 1. Dashboard Inteligente (`/`)

- **Visualização de Dados:** Gráficos interativos alternáveis entre Temperatura, Umidade, Vento e Probabilidade de Chuva.
- **AI Insights Card:** Exibe análises geradas pelo Gemini com destaque visual para a previsão numérica da próxima hora.
- **Auto-Refresh:** Atualização automática dos dados a cada 30 minutos, com opção de atualização manual instantânea.
- **Exportação:** Download direto de relatórios em `.csv` e `.xlsx`.

### 2. Gestão de Usuários (CRUD) (`/users`)

- **Filtragem Client-Side:** Busca instantânea e reativa por texto (e-mail), permissão (role) e data de criação.
- **Modais Modulares:** Formulários de criação/edição (`UserFormDialog`) e confirmação de exclusão (`UserDeleteDialog`) segregados para limpeza de código.
- **Validação Robusta:** Zod schema validation que adapta regras dinamicamente (ex: senha obrigatória na criação, opcional na edição).

### 3. Integração Externa (`/star-wars`)

- Consumo de API externa (SWAPI) via proxy do backend.
- Paginação server-side e modal de detalhes reutilizável.

## 🔧 Componentes de Destaque

### `RainChart.tsx`

Gráfico de área customizado com gradiente `cyan`, utilizando `recharts` e tooltip personalizado para visualizar a probabilidade de chuva.

### `AiInsightCard.tsx`

Componente inteligente que gerencia múltiplos estados visuais:

- **Loading:** Loading informativo com animação pulsante.
- **Empty:** Estado amigável quando não há dados suficientes.
- **Data:** Exibe temperatura prevista com formatação numérica (`toFixed`) e alertas contextuais.

### `useUsers.ts` (Custom Hook)

Centraliza toda a complexidade da página de gestão:

- Estado da lista e do loading.
- Lógica de filtragem combinada (Search + Role + Date).
- Controle de abertura/fechamento de modais.
- Funções de CRUD (Create, Update, Delete) com feedback visual (Toasts).

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
- Encapsula a lógica de fetch externa para evitar CORS no frontend além de não depender de outras bibliotecas.

## Rotas:

> **Nota:** As rotas protegidas exigem o header `Authorization: Bearer <token>`.

## 🔐 Autenticação (Auth)

- **`POST /api/v1/auth/login`**

  - **Descrição:** Realiza login e retorna o Token JWT.
  - **Acesso:** **Público**
  - **Payload de Login:**

    ```
    {
      "email": "admin@gdash.com",
      "password": "admin123"
    }

    ```

## 👥 Usuários (Users)

Gerenciamento de usuários do sistema.

- **`POST /api/v1/users`**

  - **Descrição:** Cria um novo usuário (Registro).
  - **Acesso:** **Público**

- **`GET /api/v1/users`**

  - **Descrição:** Lista todos os usuários.
  - **Acesso:** 🔒 Protegido

- **`GET /api/v1/users/:id`**

  - **Descrição:** Busca detalhes de um usuário.
  - **Acesso:** 🔒 Protegido

- **`PATCH /api/v1/users/:id`**

  - **Descrição:** Atualiza dados (senha, email) de um usuário.
  - **Acesso:** 🔒 Protegido

- **`DELETE /api/v1/users/:id`**

  - **Descrição:** Remove um usuário do sistema.
  - **Acesso:** 🔒 Protegido

## 🌦️ Clima & Logs (Weather)

Núcleo do sistema que gerencia os dados coletados pelo pipeline.

- **`POST /api/v1/weather/logs`**

  - **Descrição:** Recebe logs do Worker (Go).
  - **Acesso:** **Público**

- **`GET /api/v1/weather/logs`**

  - **Descrição:** Lista histórico paginado.
  - **Acesso:** 🔒 Protegido
  - **Query Params:**

    - `page`: Número da página (padrão 1).
    - `limit`: Itens por página (padrão 10).

- **`GET /api/v1/weather/insights`**

  - **Descrição:** Gera análise inteligente (IA/Gemini) dos dados.
  - **Acesso:** 🔒 Protegido

- **`GET /api/v1/weather/export.csv`**

  - **Descrição:** Download do relatório em CSV.
  - **Acesso:** 🔒 Protegido

- **`GET /api/v1/weather/export.xlsx`**

  - **Descrição:** Download do relatório em Excel.
  - **Acesso:** 🔒 Protegido

## 🌌 Integração Externa (Star Wars)

Proxy para consumo da SWAPI com cache.

- **`GET /api/v1/swapi/starships`**

  - **Descrição:** Lista naves espaciais (paginado).
  - **Acesso:** 🔒 Protegido

- **`GET /api/v1/swapi/starships/:id`**

  - **Descrição:** Detalhes de uma nave específica.
  - **Acesso:** 🔒 Protegido

# GDASH Collector Service 🐍

Serviço responsável pela coleta periódica de dados climáticos da API Open-Meteo e publicação na fila RabbitMQ.

## 📋 Funcionalidades

- Consulta a API externa [Open-Meteo](https://open-meteo.com/ "null").
- Coleta dados de temperatura, umidade, vento
- Publica os dados normalizados em formato JSON na fila `weather_data`.
- Executa periodicamente (configurável via variável de ambiente).

## 🛠️ Estrutura de Pastas

```
collector/
├── src/
│   ├── domain/
│   │   └── weather.py
│   ├── infra/
│   │   ├── http_client.py
│   │   └── queue.py
│   ├── __init__.py
│   ├── config.py
│   └── main.py
├── .env
├── Dockerfile
├── env.txt
└── requirements.txt
```

# GDASH Worker Service 🐹

Serviço de alta performance escrito em Go, responsável por consumir mensagens da fila RabbitMQ e enviá-las para a API NestJS.

## 📋 Funcionalidades

- Conecta ao RabbitMQ e consome a fila `weather_data`.
- Processa e valida a estrutura JSON
- Envia os dados via HTTP POST para o Backend.
- Implementa reconexão e tratamento de erros básico.

## 🛠️ Estrutura de pastas:

```
worker/
├── internal/
│   ├── config/
│   ├── domain/
│   └── queue/
├── .env
├── Dockerfile
├── env.txt
├── go.mod
├── go.sum

```
