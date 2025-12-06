# Plataforma de Microsserviços Meteorológicos

Este projeto consiste em uma plataforma de monitoramento meteorológico construída com arquitetura de microsserviços. O sistema coleta dados climáticos, processa informações, armazena em um banco de dados e disponibiliza uma interface visual para consulta, além de gerar um **Score de Conforto** utilizando IA via **Ollama**.

---

## 🚀 Tecnologias Utilizadas

A solução é composta pelos seguintes serviços:

* **MongoDB** — Banco de dados para armazenar informações meteorológicas.
* **RabbitMQ** — Message broker para comunicação assíncrona entre microserviços.
* **Ollama** — Serviço de IA para geração de análises e score de conforto.
* **Backend (NestJS)** — API principal responsável por orquestração, autenticação e fornecimento de dados ao frontend.
* **Frontend (React + Vite)** — Interface web para exibição das informações coletadas.
* **Weather Collector (Python)** — Serviço de coleta de dados da API OpenWeather e envio via RabbitMQ.
* **Weather Worker (Go)** — Processamento dos dados recebidos e envio ao backend.
* **Docker Compose** — Orquestração completa de todos os serviços.

---

## 📦 Estrutura da Arquitetura

A arquitetura segue um padrão de microsserviços comunicando-se principalmente via **RabbitMQ**, conforme abaixo:

```
Weather Collector (Python) ---> RabbitMQ ---> Weather Worker (Go) ---> Backend (NestJS) ---> MongoDB
                                                                                       └--> Ollama (IA)
                                                                                       └--> Frontend React
```

---

## 🛠️ Pré-requisitos

Antes de iniciar, certifique-se de ter instalado:

* **Docker**
* **Docker Compose**

---

## ▶️ Como executar o projeto

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd <pasta-do-projeto>
```

2. Execute todos os serviços:

```bashgemma3:latest
docker-compose up -d --build
```
2.1 Instale manualmente o gemma3 no container weather-ollama

```bash
docker exec weather-ollama ollama pull gemma3:latest
```

3. Acesse os serviços:

* **Frontend:** [http://localhost:5173](http://localhost:5173)
* **Backend:** [http://localhost:3000](http://localhost:3000)
* **MongoDB:** localhost:27017
* **RabbitMQ Dashboard:** [http://localhost:15672](http://localhost:15672) (usuário: guest / senha: guest)
* **Ollama API:** [http://localhost:11434](http://localhost:11434)

---

## 🔧 Configurações Importantes

### Variáveis de ambiente principais

**Backend NestJS:**

* MONGODB_URI
* RABBITMQ_URL
* JWT_SECRET
* OLLAMA_API_URL
* DEFAULT_USER_EMAIL / PASSWORD / NAME / ROLE

**Collector Python:**

* OPENWEATHER_API_KEY
* LAT / LON

**Worker Go:**

* API_URL
* RABBITMQ_URL

---

## 📊 Fluxo de Dados

1. O **Collector (Python)** consulta dados climáticos externos.
2. Envia a mensagem ao **RabbitMQ**.
3. O **Worker (Go)** processa a mensagem.
4. Envia ao **Backend**, que armazena no **MongoDB**.
5. O **Backend** aciona o **Ollama** para gerar análise de conforto.
6. O **Frontend** exibe todos os dados em interface amigável.

---

## 🤖 Score de Conforto via IA

O sistema envia dados processados ao Ollama para:

* gerar análise textual;
* criar um score de conforto baseado nas condições climáticas.

---

## 📁 Estrutura do Projeto

```
/project-root
│
├── weather-backend      # API em NestJS
├── weather-frontend     # Interface em React + Vite
├── weather-collector    # Coletor Python
├── weather-worker       # Worker Go
├── docker-compose.yml   # Orquestração
└── README.md
```

---

## 🧑‍💻 Rodrigo Almeida Barbosa

Projeto desenvolvido para fins de estudo e demonstração de arquitetura baseada em microsserviços.
