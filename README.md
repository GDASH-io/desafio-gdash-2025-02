# Desafio para o processo seletivo GDASH 2025/02

Repositório destinado aos interessados em participar do processo seletivo GDASH 2025/02.

## Sobre o GDASH

No ramo da produção de energia fotovoltaica, há a modalidade de produção compartilhada. Nessa modalidade, diferentes pessoas investem na construção de uma mesma usina fotovoltaica e dividem o retorno finaceiro referente à energia gerada pela usina.

Acreditamos que as energias renováveis terão um lugar dominante em nossa economia pelo resto de nossas vidas. Trabalhamos no sentido de ampliar o impacto positivo que as energias renováveis podem ter no meio ambiente e nas nossas vidas. O sucesso da GDASH é resultado de nossa equipe apaixonada, juntamente com nosso compromisso de oferecer a melhor solução.

Sabemos que negócios enfrentam desafios únicos e por isso oferecemos soluções turnkey, customizadas, economicamente viáveis e seguras.

Somos uma startup em estágio de crescimento e você trabalhará diretamente com os fundadores, ajudando a definir a visão, o produto e a experiência do usuário.

<p align="left">
  <a href="https://www.linkedin.com/company/gdash/">
    <img src="https://img.shields.io/badge/LinkedIn-%230077B5.svg?&style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn Button">
  </a>
  <a href="https://gdash.io/">
    <img src="https://img.shields.io/badge/-Website-red" alt="GDASH Website Button">
  </a>
</p>

## Sobre a vaga

Já pensou em potencializar o setor que mais cresce na galáxia e trabalhar com uma solução que utiliza tecnologia web de ponta, altamente distribuída com foco em performance e disponibilidade? 👀

Os desenvolvedores GDASH são responsáveis por criar e manter aplicações para clientes internos e externos, prover soluções escaláveis, resilientes e altamente disponíveis que sustentem picos de acesso além de atuar como referência técnica e tutores de outros desenvolvedores.

Procuramos por pessoas dinâmicas e que queiram estar aprendendo sempre. Nossa equipe é jovem, motivada e estamos sempre em busca de soluções criativas para alcançar os resultados que nossos clientes esperam. Se você tem esse perfil, é autoconfiante, autodidata e tem facilidade para lidar com desafios diários, essa vaga é para você!

# 🚀 O Desafio

## 🧭 Visão geral
O objetivo deste desafio é desenvolver uma aplicação **full-stack** moderna que integre múltiplas linguagens e serviços, com foco em **integração entre sistemas, dados reais e uso de IA**.

Você deverá construir um sistema que:

1. **Coleta dados climáticos** (via **Open-Meteo** ou **OpenWeather**) da sua **cidade/localização**;  
2. **Envia esses dados periodicamente** para uma **fila RabbitMQ**, processada por um **worker em Go**;  
3. **Armazena os dados** em uma **API NestJS** com **MongoDB**;  
4. **Exibe um Dashboard** no frontend (React + Vite + Tailwind + shadcn/ui) com os dados coletados;  
5. Gera **insights baseados em IA** a partir das informações climáticas — podendo ser gerados automaticamente, sob demanda, ou de qualquer outra forma que você julgar adequada;  
6. Inclui:
   - **CRUD de usuários** (com autenticação e usuário padrão);
   - **Página opcional** de integração com uma **API pública paginada** (ex.: PokéAPI, Star Wars API, etc.);
   - **Exportação de dados** em **CSV/XLSX**;  
7. Toda a solução deve rodar via **Docker Compose**.

> ⚙️ **Observação importante:**  
> Os nomes de **endpoints, coleções, entidades, variáveis, bibliotecas e estruturas** usados neste documento são **apenas exemplos ilustrativos**.  
> Você pode (e deve) adotar as convenções e estruturas que considerar mais adequadas, desde que a **funcionalidade final** seja mantida.

---

## 🧩 Stack obrigatória

- **Frontend:** React + Vite + Tailwind + [shadcn/ui](https://ui.shadcn.com)  
- **Backend (API):** NestJS (TypeScript)  
- **Banco de dados:** MongoDB (Atlas ou container)  
- **Fila:** Go + RabbitMQ (obrigatória)  
- **Coleta de dados:** Python (`requests`, `httpx`, `pandas`, etc.)  
- **APIs externas:**
  - Clima (obrigatória): [Open-Meteo](https://open-meteo.com/) ou [OpenWeather](https://openweathermap.org/)
  - Opcional: qualquer API pública com **paginação**, por exemplo:
    - [PokéAPI](https://pokeapi.co/)
    - [SWAPI (Star Wars API)](https://swapi.dev/)
- **Infra:** Docker / Docker Compose  
- **Linguagem base:** **TypeScript obrigatório** (frontend e backend)

---

## ⚙️ Escopo funcional

### 1️⃣ Coleta de dados (Python → RabbitMQ)

O serviço em **Python** será responsável por:

- Buscar periodicamente (ex.: a cada 1 hora) dados da **previsão do tempo** da sua cidade/localização;  
- Extrair informações relevantes, como (exemplos):
  - Temperatura
  - Umidade
  - Velocidade do vento
  - Condição do céu
  - Probabilidade de chuva  
- Enviar os dados normalizados para uma **fila RabbitMQ** em formato **JSON**.

> 🔹 Estrutura do JSON, nomes de campos e cron/intervalo são **livres** — podem ser adaptados conforme sua arquitetura.

O Python é o **produtor dos dados meteorológicos**. A camada de IA pode ser implementada em Python, no NestJS ou em outro serviço, desde que integrada.

---

### 2️⃣ Fila (Go + RabbitMQ)

Implemente um **worker em Go**, responsável por:

- Consumir mensagens da fila RabbitMQ;  
- Validar e transformar os dados, se necessário;  
- Enviar os registros para a **API NestJS** (por exemplo, um endpoint como `POST /api/weather/logs`);  
- Confirmar as mensagens com **ack/nack**, implementar **retry básico**;  
- Registrar logs das operações principais.

> 📘 **Observação:**  
> O nome do endpoint, o body do JSON e a estrutura de erro são **apenas exemplos** neste README.  
> Você pode definir o contrato de comunicação da forma que achar melhor, desde que o fluxo Python → RabbitMQ → Go → NestJS funcione corretamente.

Bibliotecas sugeridas (não obrigatórias):

- `github.com/rabbitmq/amqp091-go`  
- `encoding/json`  
- `net/http`  

---

### 3️⃣ API (NestJS + MongoDB)

A API em **NestJS** será o núcleo do sistema, responsável por:

- Receber e armazenar os dados de clima;  
- Expor endpoints para consumo pelo frontend;  
- Orquestrar ou acionar a camada de IA;  
- Gerenciar usuários.

#### a) Dados de clima

Responsabilidades sugeridas:

- Receber registros vindos do worker Go;  
- Armazenar em uma coleção no MongoDB (ex.: `weather_logs`);  
- Expor endpoints, como (exemplos):
  - `GET /api/weather/logs` — listar registros climáticos;
  - `GET /api/weather/export.csv` — exportar CSV;
  - `GET /api/weather/export.xlsx` — exportar XLSX;
  - `GET ou POST /api/weather/insights` — gerar e/ou retornar insights de IA.

Os **insights de IA** podem ser:

- Gerados automaticamente quando novos dados são inseridos;  
- Calculados sob demanda (quando o frontend solicitar);  
- Atualizados de forma agendada.

> 💡 O importante é que o sistema seja capaz de **usar os dados históricos de clima** para produzir informações mais ricas, não apenas listar valores crus.

---

#### b) Usuários

- Implementar um **CRUD completo de usuários** (ex.: `/api/users`);  
- Implementar autenticação (JWT ou similar);  
- Criar um **usuário padrão** automaticamente na inicialização (ex.: `admin@example.com / 123456` — valores podem ser configuráveis via `.env`).

---

#### c) Integração com API pública (opcional)

Como parte opcional do desafio, implemente uma funcionalidade que consuma uma **API pública com paginação**, por exemplo:

- [PokéAPI](https://pokeapi.co/) — listagem de Pokémons + detalhe de um Pokémon;  
- [SWAPI](https://swapi.dev/) — listagem de personagens, planetas ou naves + detalhe.

Sugestão de funcionalidades (opcionais):

- Endpoint no backend que consome a API externa — o frontend não chama a API pública diretamente;  
- Paginação simples;  
- Endpoint de detalhe de um item (ex.: Pokémon, personagem, planeta).

> 🌍 Tanto o nome dos endpoints quanto o desenho das rotas ficam **totalmente a seu critério**.

---

## 🖥️ Frontend (React + Vite + Tailwind + shadcn/ui)

A aplicação frontend deve ser construída com **React + Vite**, estilizada com **Tailwind** e utilizando componentes do **shadcn/ui**.

Ela deve ter, no mínimo, **essas áreas de funcionalidade**:

---

### 🌦️ 1. Dashboard de Clima

O Dashboard será a **página principal** do sistema, exibindo:

- **Dados reais de clima** da sua cidade/localização, obtidos via pipeline Python → Go → NestJS → MongoDB;  
- **Insights de IA** gerados a partir desses dados.

A forma de exibir essas informações é **livre**.

Você pode, por exemplo, incluir:

- **Cards principais** (exemplos):
  - Temperatura atual  
  - Umidade atual  
  - Velocidade do vento  
  - Condição (ensolarado, nublado, chuvoso, etc.)  

- **Gráficos** (exemplos):
  - Temperatura ao longo do tempo;  
  - Probabilidade de chuva ao longo do tempo;  

- **Tabela de registros** (exemplo):
  - Data/hora  
  - Local  
  - Condição  
  - Temperatura  
  - Umidade  
  - Botões para exportar **CSV/XLSX** (integração com os endpoints do backend).

- **Insights de IA** (forma livre), como:
  - Texto explicativo (“Alta chance de chuva nas próximas horas”);  
  - Cards com alertas (“Calor extremo”, “Clima agradável”);  
  - Gráficos ou visualizações adicionais.

> 💡 Tudo acima são **exemplos ilustrativos**.  
> O requisito é: o Dashboard deve **mostrar os dados de clima da região + insights de IA**, mas você decide **como** isso será exibido (layout, tipos de gráfico, componentes etc.).

---

### 🌐 2. Página opcional – API pública paginada

Uma página (por exemplo, `/explorar`) consumindo a funcionalidade opcional do backend que integra com uma API pública paginada.

Exemplos de UX (apenas sugestões):

- Lista de Pokémons com paginação + página de detalhes de um Pokémon;  
- Lista de personagens de Star Wars com paginação + detalhes de um personagem.

---

### 👤 3. Usuários

Requisitos para a parte de usuários:

- Tela de **login**;  
- Rotas protegidas (somente usuário autenticado acessa o Dashboard);  
- CRUD de usuários (listar, criar, editar, remover);  
- Uso de componentes do **shadcn/ui** (Button, Input, Table, Dialog, Toast, etc.);  
- Feedback visual adequado (loading, erro, sucesso).

---

## 📁 Exportação de dados

- O backend deve expor endpoints para exportar dados de clima em **CSV** e **XLSX**;  
- O frontend deve oferecer botões no Dashboard para fazer o download desses arquivos.

---

## 💡 Ideias de insights (para `/api/weather/insights` ou similar)

A forma de aplicar IA é livre. Algumas ideias possíveis:

- Cálculo de média de temperatura e umidade em determinados períodos;  
- Detecção de tendência (temperaturas subindo ou caindo);  
- Pontuação de conforto climático (0–100);  
- Classificação do dia: “frio”, “quente”, “agradável”, “chuvoso”;  
- Alertas: “Alta chance de chuva”, “Calor extremo”, “Frio intenso”;  
- Geração de resumos em texto (ex.: “Nos últimos 3 dias, a temperatura média foi de 28°C, com alta umidade e tendência de chuva no fim da tarde.”).

> 🔍 Os exemplos acima são **sugestões inspiracionais**.  
> O que será implementado (e em qual serviço) fica a seu critério, desde que seja **coerente com os dados de clima**.

---

## 🧠 Critérios de avaliação

- **Funcionalidade completa:** pipeline Python → RabbitMQ → Go → NestJS → MongoDB → Frontend;  
- **Clareza de arquitetura:** organização de pastas, camadas e responsabilidades;  
- **Qualidade de código:** tipagem, legibilidade, padrões adotados;  
- **Integração entre serviços:** comunicação estável e bem tratada;  
- **Boas práticas:** validação, tratamento de erros, logs, eslint/prettier;  
- **UX:** experiência de uso do Dashboard e das telas;  
- **Criatividade:** na forma de mostrar dados e insights;  
- **Documentação:** README claro, com passos de execução e configuração;  
- **Uso correto do Docker Compose** para subir tudo.

**Bônus (não obrigatório):**

- Logs detalhados por serviço;  
- CI (lint/test) configurado;  
- Dashboard com filtros, múltiplos tipos de gráfico;  
- Deploy em ambiente gratuito (Railway, Render, etc.);  
- Testes automatizados (unitários e/ou e2e).

---

## ⚠️ Regras

- Respeitar termos de uso das APIs utilizadas (Open-Meteo/OpenWeather, PokéAPI, SWAPI, etc.);  
- Não coletar ou armazenar dados pessoais sensíveis;  
- Usar intervalos razoáveis para chamadas às APIs externas;  
- Focar em **integração, clareza e coesão**, não apenas em adicionar complexidade;  
- Você é livre para:
  - Renomear endpoints;
  - Alterar nomes de coleções;
  - Mudar estruturas de diretórios;
  - Escolher bibliotecas auxiliares — desde que a proposta do desafio seja atendida.

---

## 📹 Vídeo obrigatório

Grave um vídeo de **até 5 minutos** explicando:

- Arquitetura geral da aplicação;  
- Pipeline de dados (Python → RabbitMQ → Go → NestJS → Frontend);  
- Como os insights de IA são gerados e exibidos;  
- Principais decisões técnicas;  
- Demonstração rápida da aplicação rodando via Docker Compose.

O vídeo deve ser enviado via:

- **YouTube (não listado)**.

Inclua o link no README e/ou na descrição do Pull Request.

---

## 🧪 Entrega

A entrega deve ser feita via **Pull Request**, em uma **branch com o seu nome completo**, por exemplo:

- `joao-silva`  
- `maria-fernanda-souza`

O Pull Request deve conter:

- Código do **backend (NestJS)**;  
- Código do **frontend (Vite)**;  
- Código **Python** (coleta de clima);  
- Código **Go** (worker da fila);  
- `docker-compose.yml` com todos os serviços (API, frontend, banco, RabbitMQ, etc.);  
- Arquivo `.env.example` com todas as variáveis necessárias;  
- Link do vídeo explicativo (YouTube não listado);  
- README com:
  - Como rodar tudo via Docker Compose;  
  - Como rodar o serviço Python;  
  - Como rodar o worker Go;  
  - URLs principais (API, frontend, Swagger, etc.);  
  - Usuário padrão (login/senha) para acesso inicial.

---

## ✅ Checklist rápido

- [ ] Python coleta dados de clima (Open-Meteo ou OpenWeather)  
- [ ] Python envia dados para RabbitMQ  
- [ ] Worker Go consome a fila e envia para a API NestJS  
- [ ] API NestJS:
  - [ ] Armazena logs de clima em MongoDB  
  - [ ] Exponde endpoints para listar dados  
  - [ ] Gera/retorna insights de IA (endpoint próprio)  
  - [ ] Exporta dados em CSV/XLSX  
  - [ ] Implementa CRUD de usuários + autenticação  
  - [ ] (Opcional) Integração com API pública paginada  
- [ ] Frontend React + Vite + Tailwind + shadcn/ui:
  - [ ] Dashboard de clima com dados reais  
  - [ ] Exibição de insights de IA  
  - [ ] CRUD de usuários + login  
  - [ ] (Opcional) Página consumindo API pública paginada  
- [ ] Docker Compose sobe todos os serviços  
- [ ] Código em TypeScript (backend e frontend)  
- [ ] Vídeo explicativo (máx. 5 minutos)  
- [ ] Pull Request via branch com seu nome completo  
- [ ] README completo com instruções de execução  
- [ ] Logs e tratamento de erros básicos em cada serviço  

---

Boa sorte! 🚀  
Mostre sua capacidade de integrar múltiplas linguagens e serviços em uma aplicação moderna, escalável e inteligente — unindo **engenharia de dados**, **backend**, **frontend** e **IA aplicada**.

---

# 📋 Documentação da Implementação

## 🏗️ Arquitetura

Este projeto implementa um pipeline completo de dados climáticos:

```
Python (Collector) → RabbitMQ → Go (Worker) → NestJS (API) → MongoDB → React (Frontend)
```

### Componentes

1. **Collector Python** (`/collector-python`): Coleta dados climáticos periodicamente e publica no RabbitMQ
2. **Worker Go** (`/worker-go`): Consome mensagens do RabbitMQ e envia para a API NestJS
3. **Backend NestJS** (`/backend`): API REST com autenticação JWT, CRUD de usuários, armazenamento de dados climáticos, geração de insights e exportação
4. **Frontend React** (`/frontend`): Dashboard com visualizações, CRUD de usuários e integração com API externa
5. **MongoDB**: Banco de dados NoSQL
6. **RabbitMQ**: Fila de mensagens

## 🚀 Como Executar

### Pré-requisitos

- Docker e Docker Compose instalados
- Git

### Passo a Passo

1. **Clone o repositório** (se ainda não tiver feito):
```bash
git clone <url-do-repositorio>
cd desafio-gdash-2025-02
```

2. **Crie o arquivo `.env`** na raiz do projeto:
```bash
cp .env.example .env
```

Edite o arquivo `.env` e ajuste as variáveis conforme necessário (veja seção de variáveis abaixo).

3. **Suba todos os serviços com Docker Compose**:
```bash
docker compose up --build
```

Este comando irá:
- Construir todas as imagens Docker
- Subir MongoDB, RabbitMQ, API NestJS, Frontend, Collector Python e Worker Go
- Criar automaticamente o usuário admin padrão

4. **Aguarde alguns segundos** para todos os serviços iniciarem completamente.

5. **Acesse a aplicação**:
   - Frontend: http://localhost:5173
   - API Swagger: http://localhost:3000/api/docs
   - RabbitMQ Management: http://localhost:15672 (admin/admin123)

### Credenciais Padrão

- **Email**: `admin@gdash.io`
- **Senha**: `admin123`

> ⚠️ **Nota**: As credenciais podem ser alteradas no arquivo `.env` através das variáveis `ADMIN_EMAIL` e `ADMIN_PASSWORD`.

## 📁 Estrutura do Projeto

```
desafio-gdash-2025-02/
├── backend/              # API NestJS
│   ├── src/
│   │   ├── auth/        # Módulo de autenticação
│   │   ├── users/       # CRUD de usuários
│   │   ├── weather/     # Dados climáticos e exportação
│   │   ├── insights/    # Geração de insights de IA
│   │   └── external-api/# Integração com PokéAPI
│   └── Dockerfile
├── frontend/            # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/  # Componentes UI (shadcn/ui)
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── services/    # Serviços de API
│   │   └── lib/         # Utilitários
│   └── Dockerfile
├── collector-python/    # Serviço de coleta de dados
│   ├── main.py
│   └── Dockerfile
├── worker-go/           # Worker que processa fila
│   ├── main.go
│   └── Dockerfile
├── docker-compose.yml   # Orquestração de todos os serviços
├── .env.example         # Exemplo de variáveis de ambiente
└── README.md
```

## ⚙️ Variáveis de Ambiente

### MongoDB
- `MONGO_ROOT_USERNAME`: Usuário root do MongoDB (padrão: `admin`)
- `MONGO_ROOT_PASSWORD`: Senha root do MongoDB (padrão: `admin123`)
- `MONGO_DATABASE`: Nome do banco de dados (padrão: `gdash`)

### RabbitMQ
- `RABBITMQ_USER`: Usuário do RabbitMQ (padrão: `admin`)
- `RABBITMQ_PASSWORD`: Senha do RabbitMQ (padrão: `admin123`)

### Backend NestJS
- `JWT_SECRET`: Chave secreta para JWT (altere em produção!)
- `JWT_EXPIRES_IN`: Tempo de expiração do token (padrão: `24h`)
- `ADMIN_EMAIL`: Email do usuário admin padrão (padrão: `admin@gdash.io`)
- `ADMIN_PASSWORD`: Senha do usuário admin padrão (padrão: `admin123`)
- `OPENAI_API_KEY`: (Opcional) Chave da API OpenAI para insights avançados

### Frontend
- `VITE_API_URL`: URL base da API (padrão: `http://localhost:3000/api`)

### Collector Python
- `WEATHER_API_PROVIDER`: Provedor de clima (`open-meteo` ou `openweather`)
- `WEATHER_API_KEY`: Chave da API (necessário apenas para OpenWeather)
- `CITY_NAME`: Nome da cidade (padrão: `Maceió, BR`)
- `LATITUDE`: Latitude da cidade (padrão: `-9.5713`)
- `LONGITUDE`: Longitude da cidade (padrão: `-36.7820`)
- `RABBITMQ_QUEUE`: Nome da fila (padrão: `weather.readings`)
- `PULL_INTERVAL_SECONDS`: Intervalo de coleta em segundos (padrão: `3600` = 1 hora)

### Worker Go
- `API_BASE_URL`: URL base da API NestJS (padrão: `http://api:3000`)
- `API_WEATHER_INGEST_PATH`: Endpoint de ingestão (padrão: `/api/weather/logs`)
- `MAX_RETRIES`: Número máximo de tentativas (padrão: `3`)

## 🔧 Executando Serviços Individualmente

### Backend NestJS

```bash
cd backend
npm install
npm run start:dev
```

### Frontend React

```bash
cd frontend
npm install
npm run dev
```

### Collector Python

```bash
cd collector-python
pip install -r requirements.txt
python main.py
```

### Worker Go

```bash
cd worker-go
go mod download
go run main.go
```

## 📡 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Fazer login

### Usuários (requer autenticação)
- `GET /api/users` - Listar usuários (com paginação)
- `GET /api/users/:id` - Buscar usuário por ID
- `POST /api/users` - Criar usuário (admin only)
- `PATCH /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Remover usuário (admin only)

### Clima (requer autenticação, exceto POST /logs)
- `POST /api/weather/logs` - Criar registro (usado pelo worker)
- `GET /api/weather/logs` - Listar registros (com filtros)
- `GET /api/weather/logs/latest` - Último registro
- `GET /api/weather/export.csv` - Exportar CSV
- `GET /api/weather/export.xlsx` - Exportar XLSX

### Insights (requer autenticação)
- `GET /api/insights/weather` - Gerar insights de clima

### API Externa (requer autenticação)
- `GET /api/external/pokemon` - Listar Pokémons (com paginação)
- `GET /api/external/pokemon/:id` - Detalhes de um Pokémon

## 🎯 Funcionalidades Implementadas

✅ Coleta periódica de dados climáticos (Python → RabbitMQ)  
✅ Worker em Go consumindo fila e enviando para API  
✅ API NestJS com MongoDB  
✅ Autenticação JWT  
✅ CRUD completo de usuários  
✅ Dashboard de clima com gráficos  
✅ Geração de insights de IA  
✅ Exportação CSV e XLSX  
✅ Integração com PokéAPI  
✅ Frontend React com shadcn/ui  
✅ Docker Compose para subir tudo  
✅ Usuário admin criado automaticamente  

## 🐛 Troubleshooting

### Serviços não iniciam
- Verifique se as portas 3000, 5173, 27017, 5672, 15672 estão livres
- Verifique os logs: `docker compose logs [servico]`

### Erro de conexão com MongoDB
- Aguarde alguns segundos após subir os containers
- Verifique se o MongoDB está saudável: `docker compose ps`

### Erro de conexão com RabbitMQ
- Verifique se o RabbitMQ está rodando: `docker compose ps`
- Acesse o management UI: http://localhost:15672

### Frontend não carrega dados
- Verifique se a variável `VITE_API_URL` está correta
- Verifique se você está autenticado (token no localStorage)

### Collector não coleta dados
- Verifique os logs: `docker compose logs collector-python`
- Verifique se as coordenadas (LATITUDE/LONGITUDE) estão corretas
- Para OpenWeather, verifique se `WEATHER_API_KEY` está configurada

## 📝 Notas Adicionais

- O collector Python coleta dados a cada 1 hora por padrão (configurável via `PULL_INTERVAL_SECONDS`)
- Os insights são calculados com base em médias, tendências e fórmulas de conforto climático
- A exportação CSV/XLSX limita a 10.000 registros por padrão
- O usuário admin é criado automaticamente na primeira inicialização da API

## 🎥 Vídeo Explicativo

[Link do vídeo será adicionado aqui]

---

**Desenvolvido para o desafio técnico GDASH 2025/02** 🚀