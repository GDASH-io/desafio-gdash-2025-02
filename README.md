# 🌦️ GDASH Challenge – Intelligent Weather Monitor

Uma plataforma Full-Stack de monitoramento climático em tempo real, baseada em arquitetura de microsserviços orientada a eventos e alimentada por Inteligência Artificial Generativa.

![Status](https://img.shields.io/badge/Status-Finished-brightgreen)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue)
![AI](https://img.shields.io/badge/AI-Gemini-critical)

---

## 🧠 Configuração da Inteligência Artificial (IMPORTANTE⚠️)

O sistema utiliza o **Google Gemini 1.5 Flash** para gerar *insights* climáticos avançados.

Sem a chave de API, o projeto funciona em modo de contingência (*Fallback*), com regras locais simplificadas.

---

## 🔑 Como gerar sua chave

1. Acesse o **Google AI Studio**:  
   https://aistudio.google.com/app/apikey

2. Clique em **Create API key**.

3. Copie a chave gerada (começa com `Aiza...`).

---

## 🧪 Onde inserir a chave

Abra o arquivo `docker-compose.yml` na raiz do projeto e cole sua chave na variável `GEMINI_API_KEY`:

```yaml
collector:
  environment:
    GEMINI_API_KEY: "SUA_CHAVE_AQUI"

---

## 📋 Sobre o Projeto

Esta solução foi desenvolvida como parte do processo seletivo da GDASH. O objetivo foi criar um sistema resiliente e escalável que não apenas coleta dados meteorológicos, mas gera **inteligência contextual** sobre eles.

O sistema coleta dados da Open-Meteo, processa-os através de uma pipeline de mensageria robusta e apresenta-os num Dashboard interativo que se adapta visualmente ao ciclo dia/noite.

### 🚀 Diferenciais Implementados
* **IA Generativa Real:** Integração com **Google Gemini 1.5 Flash** para gerar insights climáticos únicos e humanizados.
* **Resiliência (Fallback):** Sistema de contingência que ativa uma lógica local robusta caso a API de IA falhe ou fique offline.
* **UX Profissional:** Interface moderna que alterna temas automaticamente (Dia/Noite) e gráficos fluídos sem "flicker" de carregamento.
* **Auditoria:** Ferramentas completas de filtragem histórica e exportação de relatórios oficiais (Excel/CSV).

---

## ⚙️ Arquitetura da Solução

O sistema segue uma arquitetura desacoplada onde cada serviço possui responsabilidade única:

![Diagrama de Arquitetura](./assets/arquitetura.jpg)

1.  **Collector (Python 3.11):**
    * Ingestão de dados da Open-Meteo.
    * Conexão com Google Gemini para enriquecimento de dados (Insights).
    * Produtor de mensagens para o RabbitMQ.
2.  **Message Broker (RabbitMQ):**
    * Garante o desacoplamento e a persistência dos dados entre coleta e processamento.
3.  **Worker (Go 1.24):**
    * Consumidor de alta performance.
    * Processa a fila e despacha os dados validados para a API via HTTP.
4.  **API (NestJS / Node 20):**
    * Gestão de regras de negócio, autenticação JWT e persistência no MongoDB.
    * Geração de relatórios (Excel/CSV).
    * Documentação automática via Swagger.
5.  **Frontend (React + Vite):**
    * Dashboard em tempo real (Polling inteligente).
    * Gráficos interativos com Recharts e estilização com Tailwind CSS.

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia | Detalhes |
| :--- | :--- | :--- |
| **Infraestrutura** | Docker & Compose | Orquestração completa dos 6 serviços |
| **Coleta & IA** | Python 3.11 | Requests, Pika, Google GenAI SDK |
| **Mensageria** | RabbitMQ | Gestão de filas e exchanges |
| **Worker** | Go (Golang) 1.24 | Processamento concorrente de alta velocidade |
| **Backend** | NestJS (Node 20) | TypeScript, Mongoose, Swagger, ExcelJS |
| **Banco de Dados** | MongoDB | Armazenamento de logs históricos |
| **Frontend** | React (Vite) | TypeScript, TailwindCSS, Recharts |

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
* **Docker** e **Docker Compose** instalados e rodando.

### Passo a Passo

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/alvaro-amorim/desafio-gdash-2025-02.git
    cd gdash-challenge
    ```

2.  **Gerar a chave API & modificar o código rapidamente:**  
    - Gere sua chave no **Google AI Studio** (veja seção "Como gerar sua chave" acima).  
    - Edite **docker-compose.yml** na raiz do projeto e cole a chave em `GEMINI_API_KEY`:
      ```yaml
      collector:
        environment:
          GEMINI_API_KEY: "Aiza...SUA_CHAVE..."
      ```
    - *Alternativa rápida via terminal* (não precisa alterar arquivo):
      ```bash
      export GEMINI_API_KEY="Aiza...SUA_CHAVE..."
      ```
    - Se quiser testar sem IA (modo fallback), deixe a variável vazia ou remova temporariamente a chave:
      ```yaml
      GEMINI_API_KEY: ""
      ```
    (Instruções detalhadas sobre geração da chave estão na seção de Configuração da IA.)

3.  **Suba a infraestrutura:**  
    Execute o comando abaixo na raiz do projeto. O flag `--build` garante que as imagens mais recentes (com as configurações de IA e temas) sejam geradas.
    ```bash
    docker-compose up -d --build
    ```
    *Aguarde alguns instantes para o download das imagens e inicialização dos serviços.*

4.  **Verifique o status:**
    ```bash
    docker ps
    ```
    Todos os 6 containers (`gdash_frontend`, `gdash_backend`, `gdash_worker`, `gdash_collector`, `mongo`, `rabbitmq`) devem estar com status `Up`.

---

## 🔑 Acesso ao Sistema

### 🖥️ Dashboard (Frontend)
* **URL:** [http://localhost:5173](http://localhost:5173)
* **Credenciais de Acesso (Admin):**
    * **Email:** `admin@gdash.io`
    * **Senha:** `123456`

### 📚 Documentação da API (Swagger)
* **URL:** [http://localhost:3000/api](http://localhost:3000/api)
* Explore e teste os endpoints diretamente pelo navegador.

### 🐰 Painel do RabbitMQ
* **URL:** [http://localhost:15672](http://localhost:15672)
* **Login:** `admin` / `password123`

---

## 📹 Vídeo de Apresentação

Confira a demonstração completa da arquitetura e funcionamento do sistema no link abaixo:

[**▶️ Assistir Vídeo no YouTube**](https://youtu.be/YfpOK7r9LLI)

---

Desenvolvido por **Álvaro Amorim**
