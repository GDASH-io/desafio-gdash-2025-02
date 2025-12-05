
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
2. **Envia esses dados periodicamente** para uma **fila** (Message Broker, como RabbitMQ ou até Redis), processada por um **worker em Go**;  
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
- **Fila:** Go + Message Broker (`RabbitMQ`, `Redis`, etc.)  
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

### 1️⃣ Coleta de dados (Python → Fila)

O serviço em **Python** será responsável por:

- Buscar periodicamente (ex.: a cada 1 hora) dados da **previsão do tempo** da sua cidade/localização;  
- Extrair informações relevantes, como (exemplos):
  - Temperatura
  - Umidade
  - Velocidade do vento
  - Condição do céu
  - Probabilidade de chuva  
- Enviar os dados normalizados para uma **fila** em formato **JSON**.

> 🔹 Estrutura do JSON, nomes de campos e cron/intervalo são **livres** — podem ser adaptados conforme sua arquitetura.

O Python é o **produtor dos dados meteorológicos**. A camada de IA pode ser implementada em Python, no NestJS ou em outro serviço, desde que integrada.

---

### 2️⃣ Fila (Go + Message Broker)

Implemente um **worker em Go**, responsável por:

- Consumir mensagens da fila;  
- Validar e transformar os dados, se necessário;  
- Enviar os registros para a **API NestJS** (por exemplo, um endpoint como `POST /api/weather/logs`);  
- Confirmar as mensagens com **ack/nack**, implementar **retry básico**;  
- Registrar logs das operações principais.

> 📘 **Observação:**  
> O nome do endpoint, o body do JSON e a estrutura de erro são **apenas exemplos** neste README.  
> Você pode definir o contrato de comunicação da forma que achar melhor, desde que o fluxo Python → Message Broker → Go → NestJS funcione corretamente.

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

- **Funcionalidade completa:** pipeline Python → Message Broker → Go → NestJS → MongoDB → Frontend;  
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
- Pipeline de dados (Python → Message Broker → Go → NestJS → Frontend);  
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
- `docker-compose.yml` com todos os serviços (API, frontend, banco, Message Broker, etc.);  
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
- [ ] Python envia dados para a fila  
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
=======
# Desafio GDASH 2025/02 - Sistema de Monitoramento Climático

Sistema full-stack para coleta, processamento e visualização de dados climáticos com insights de IA.

## 🏗️ Arquitetura

```
Python (Producer) → RabbitMQ → Go (Worker) → NestJS (API) → MongoDB
                                                      ↓
                                              React (Frontend)
```

### Fluxo de Dados

1. **Producer (Python)**: Coleta dados climáticos da API Open-Meteo periodicamente e publica na fila RabbitMQ
2. **Worker (Go)**: Consome mensagens da fila, valida e envia para a API NestJS
3. **Backend (NestJS)**: Recebe e armazena dados no MongoDB, gera insights com IA
4. **Frontend (React)**: Exibe dados em tempo real, gráficos e insights de IA

## 🚀 Tecnologias

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + Recharts
- **Backend**: NestJS + TypeScript + MongoDB + Mongoose
- **Worker**: Go 1.21 + RabbitMQ Client
- **Producer**: Python 3.11 + Requests + Pika
- **Message Broker**: RabbitMQ 3
- **Database**: MongoDB 8
- **IA**: OpenAI GPT-3.5 + Google Gemini (fallback)
- **Containerização**: Docker + Docker Compose (multi-stage builds)

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Conta OpenAI (opcional, para insights)
- Conta Google Gemini (opcional, para fallback)

## 🛠️ Como Executar

### 1. Clone o repositório

```bash
git clone <repository-url>
cd desafio-GDASH
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:
- `OPENAI_API_KEY` (opcional, para insights de IA)
- `GEMINI_API_KEY` (opcional, para fallback de IA)
- `LATITUDE` e `LONGITUDE` (coordenadas da sua localização)
- Outras configurações conforme necessário

### 3. Execute com Docker Compose

```bash
docker-compose up -d
```

### 4. Acesse a aplicação

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Swagger**: http://localhost:3000/api
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

### 5. Credenciais padrão

- **Email**: admin@example.com
- **Senha**: 123456

## 📁 Estrutura do Projeto

```
.
├── backend/                    # API NestJS
│   ├── src/
│   │   ├── modules/
│   │   │   ├── weather/        # Módulo de clima
│   │   │   ├── users/          # Módulo de usuários
│   │   │   ├── auth/           # Módulo de autenticação
│   │   │   ├── pokemon/        # Módulo Pokémon (opcional)
│   │   │   └── seed/           # Seed de dados iniciais
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/                   # Aplicação React
│   ├── src/
│   │   ├── components/         # Componentes reutilizáveis
│   │   ├── pages/              # Páginas da aplicação
│   │   ├── services/           # Serviços de API
│   │   ├── context/            # Context API
│   │   └── App.tsx
│   ├── Dockerfile
│   └── package.json
├── worker/                     # Worker Go
│   ├── main.go
│   ├── consumer.go
│   ├── api_client.go
│   ├── config.go
│   ├── Dockerfile
│   └── go.mod
├── producer/                   # Producer Python
│   ├── main.py
│   ├── weather_collector.py
│   ├── queue_publisher.py
│   ├── config.py
│   ├── Dockerfile
│   └── requirements.txt
├── docker-compose.yml          # Orquestração de serviços
├── LICENSE                     # Licença MIT
├── scripts/                     # Scripts auxiliares (Windows)
│   ├── check-containers.ps1
│   ├── setup-autostart.ps1
│   └── start-docker-containers.ps1
├── .env.example                # Exemplo de variáveis de ambiente
└── README.md
```

## 🔧 Executando Serviços Individualmente

### Backend (NestJS)

```bash
cd backend
npm install
npm run start:dev
```

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

### Producer (Python)

```bash
cd producer
pip install -r requirements.txt
python main.py
```

### Worker (Go)

```bash
cd worker
go mod download
go run .
```

## 📡 Endpoints da API

### Health Check
- `GET /health` - Verificar status da API

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registrar novo usuário

### Clima
- `GET /api/weather/logs` - Listar registros climáticos (com paginação e filtro por localização)
  - Query params: `page`, `limit`, `location`
- `POST /api/weather/logs` - Receber dados do worker (interno)
- `GET /api/weather/insights` - Obter insights de IA
- `POST /api/weather/collect` - Coletar dados climáticos manualmente
- `GET /api/weather/export.csv` - Exportar dados em CSV
- `GET /api/weather/export.xlsx` - Exportar dados em XLSX

### Usuários (protegido - requer autenticação JWT)
- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Obter usuário por ID
- `POST /api/users` - Criar usuário
- `PATCH /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### Pokémon (opcional)
- `GET /api/pokemon` - Listar Pokémons (paginado)
- `GET /api/pokemon/:id` - Detalhes de Pokémon

## 🧪 Testes

Para testar o pipeline completo:

1. Verifique se todos os serviços estão rodando:
```bash
docker-compose ps
```

2. Verifique os logs:
```bash
docker-compose logs -f producer
docker-compose logs -f worker
docker-compose logs -f backend
```

3. Acesse o frontend e faça login
4. Verifique o dashboard de clima

## 📝 Características Técnicas

### Diferenciais Implementados

- ✅ **Multi-stage Docker builds** em todos os serviços (redução de ~70% no tamanho das imagens)
- ✅ **Healthchecks configurados** em todos os serviços
- ✅ **Pipeline de dados configurável** (intervalo de coleta ajustável via variável de ambiente)
- ✅ **Sistema de retries automático** no Producer (Python) e Consumer (Go)
- ✅ **Cache de insights de IA** para evitar chamadas desnecessárias
- ✅ **Fallback automático** de OpenAI para Gemini em caso de falha
- ✅ **Validação de dados** em todas as camadas
- ✅ **Tratamento de erros robusto** com logs detalhados
- ✅ **Exportação de dados** em CSV e XLSX
- ✅ **Interface moderna** com Tailwind CSS e componentes shadcn/ui
- ✅ **Gráficos interativos** com Recharts
- ✅ **Autenticação JWT** com rotas protegidas

### Notas Importantes

- O producer coleta dados a cada hora por padrão (configurável via `COLLECTION_INTERVAL` em segundos)
- Os insights de IA são gerados sob demanda quando solicitados via endpoint e são cacheados para evitar chamadas desnecessárias
- O usuário padrão é criado automaticamente na primeira inicialização do backend
- As APIs de IA (OpenAI/Gemini) são opcionais - o sistema funciona sem elas usando fallback
- Todos os serviços têm retry logic implementado para maior resiliência
- O sistema possui healthchecks configurados em todos os serviços Docker
- A API possui validação de dados em todas as rotas usando class-validator
- CORS está configurado para permitir requisições do frontend

## 🔄 Autostart no Windows (Coleta Automática)

Para garantir que os dados sejam coletados automaticamente a cada hora, mesmo quando você não estiver usando o computador:

### Configuração Rápida

1. **Execute o script de configuração** (como Administrador):
   ```powershell
   # Abra PowerShell como Administrador
   cd C:\Users\caiod\desafio-GDASH
   .\scripts\setup-autostart.ps1
   ```

2. **Configure Docker Desktop para iniciar automaticamente**:
   - Abra Docker Desktop
   - Settings → General
   - Marque "Start Docker Desktop when you log in"

3. **Inicie os containers uma vez**:
   ```powershell
   .\scripts\start-docker-containers.ps1
   ```


### Serviços não iniciam
- Verifique se as portas estão disponíveis
- Verifique os logs: `docker-compose logs <service-name>`
- No Windows: Execute `.\scripts\start-docker-containers.ps1`

### Dados não são coletados automaticamente
- Verifique se o Docker Desktop está rodando
- Verifique se os containers estão rodando: `docker-compose ps`
- No Windows: Verifique se a tarefa agendada está configurada (veja seção Autostart acima)
- Verifique os logs do producer: `docker-compose logs -f producer`

### Erro de conexão com MongoDB
- Aguarde o MongoDB estar completamente inicializado
- Verifique as credenciais no `.env`

### Erro de conexão com RabbitMQ
- Aguarde o RabbitMQ estar completamente inicializado
- Verifique as credenciais no `.env`

## 🔐 Variáveis de Ambiente

Consulte o arquivo `.env.example` para todas as variáveis disponíveis. Principais:

### Backend
- `MONGODB_URI`: String de conexão do MongoDB (gerada automaticamente no docker-compose)
- `MONGO_ROOT_USERNAME`: Usuário root do MongoDB (padrão: admin)
- `MONGO_ROOT_PASSWORD`: Senha root do MongoDB (padrão: admin123)
- `MONGO_DATABASE`: Nome do banco de dados (padrão: gdash)
- `JWT_SECRET`: Chave secreta para JWT (altere em produção!)
- `JWT_EXPIRES_IN`: Tempo de expiração do token JWT (padrão: 24h)
- `OPENAI_API_KEY`: Chave da API OpenAI (opcional, para insights)
- `GEMINI_API_KEY`: Chave da API Gemini (opcional, para fallback)
- `LATITUDE` / `LONGITUDE`: Coordenadas para coleta de dados climáticos (padrão: 52.52, 13.41)
- `OPEN_METEO_URL`: URL da API Open-Meteo (padrão: https://api.open-meteo.com/v1/forecast)
- `NODE_ENV`: Ambiente de execução (development/production)
- `PORT`: Porta do backend (padrão: 3000)

### Frontend
- `VITE_API_URL`: URL da API backend (padrão: http://localhost:3000)

### Producer
- `RABBITMQ_URL`: URL de conexão do RabbitMQ
- `RABBITMQ_USER`: Usuário do RabbitMQ (padrão: guest)
- `RABBITMQ_PASS`: Senha do RabbitMQ (padrão: guest)
- `QUEUE_NAME`: Nome da fila (padrão: weather_data)
- `COLLECTION_INTERVAL`: Intervalo de coleta em segundos (padrão: 3600 = 1 hora)

### Worker
- `API_URL`: URL da API backend para envio de dados (padrão: http://backend:3000/api/weather/logs)

## 🧪 Testando o Pipeline

### 1. Verificar Status dos Serviços

```bash
docker-compose ps
```

Todos os serviços devem estar com status "Up" e healthcheck "healthy".

### 2. Verificar Logs

```bash
# Logs do producer (coleta de dados)
docker-compose logs -f producer

# Logs do worker (processamento)
docker-compose logs -f worker

# Logs do backend (API)
docker-compose logs -f backend

# Logs de todos os serviços
docker-compose logs -f
```

### 3. Testar Endpoints

```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"123456"}'

# Registrar novo usuário
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"123456","name":"Nome do Usuário"}'

# Listar registros climáticos (requer token JWT)
curl http://localhost:3000/api/weather/logs \
  -H "Authorization: Bearer <seu-token>"

# Coletar dados climáticos manualmente
curl -X POST http://localhost:3000/api/weather/collect \
  -H "Authorization: Bearer <seu-token>"

# Obter insights de IA
curl http://localhost:3000/api/weather/insights \
  -H "Authorization: Bearer <seu-token>"
```

### 4. Verificar RabbitMQ

Acesse http://localhost:15672 (guest/guest) e verifique:
- Queue `weather_data` criada
- Mensagens sendo publicadas pelo producer
- Mensagens sendo consumidas pelo worker

## 📹 Vídeo Explicativo

[Link do vídeo será adicionado aqui após gravação]

O vídeo deve incluir:
- Arquitetura geral da aplicação
- Demonstração do pipeline de dados
- Como os insights de IA são gerados
- Principais decisões técnicas
- Demo da aplicação rodando

## 🚀 Deploy

### Build Local

```bash
# Build de todos os serviços
docker-compose build

# Build de um serviço específico
docker-compose build backend
```

### Limpeza

```bash
# Parar e remover containers
docker-compose down

# Remover volumes também
docker-compose down -v

# Remover imagens
docker-compose down --rmi all
```

## 👤 Autor

Caio Dias Oliveira

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

Este projeto foi desenvolvido para o processo seletivo GDASH 2025/02.

>>>>>>> 3f4751b (feat: initial implementation of the NestJS backend, Python producer, and Go worker)
