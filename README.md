# 🌐 Aplicação Fullstack com NestJS, React, Go Worker e Docker

## 📖 Descrição
Este projeto é uma aplicação completa que integra **frontend (React + Vite + Tailwind + shadcn/ui)**, **backend (NestJS + MongoDB)** e um **worker em Go** para processamento assíncrono de dados climáticos.  
A solução inclui autenticação, CRUD de usuários, integração com APIs públicas, coleta de dados meteorológicos e geração de insights com IA.

---

## 🚀 Funcionalidades

### 👥 Usuários
- CRUD completo de usuários (criar, listar, atualizar, excluir).
- Tela de login com proteção por token JWT.
- **Admin**:
  - Pode apagar qualquer usuário comum.
- **Usuário comum**:
  - Pode apagar apenas sua própria conta.

### 🟡 Pokémons
- Lista de Pokémons consumindo API pública (PokéAPI).
- Ao clicar em um card, abre popup com detalhes do Pokémon.

### 🌦️ Clima
- Coleta dados climáticos da cidade/localização via **Open-Meteo** ou **OpenWeather**.
- Envia periodicamente os dados para uma fila (RabbitMQ ou Redis).
- Worker em Go processa os dados e envia para API NestJS.
- API NestJS armazena os dados em MongoDB.
- Dashboard no frontend exibe os dados coletados.
- Geração de insights com IA:

### 📊 Exportação
- Exportação de dados em **CSV/XLSX**.

### 🐳 Docker Compose
- Toda a solução roda via **Docker Compose**:
  - `frontend` (React + Vite).
  - `backend` (NestJS + MongoDB).
  - `worker` (Go).
  - `message-broker` (RabbitMQ ou Redis).

---

## ⚙️ Como executar

### 1. Fazer um fork do repositório
1. Acesse o repositório original no GitHub:  
   [https://github.com/imd14s/desafio-gdash-2025-02](https://github.com/imd14s/desafio-gdash-2025-02)
2. Clique no botão **Fork** (canto superior direito) para criar uma cópia do projeto na sua conta GitHub.
3. Após o fork, você terá o repositório disponível em `https://github.com/seu-usuario/desafio-gdash-2025-02`.

---

### 2. Clonar o repositório
Clone o repositório que você acabou de fazer fork:

```bash
git clone git@github.com:seu-usuario/desafio-gdash-2025-02.git
cd desafio-gdash-2025-02
```

### 3. Configurar variáveis de ambiente
Crie arquivos .env em cada serviço:

### 4. Subir containers com Docker Compose

Execute o comando abaixo na raiz do projeto:

```bash
docker-compose up --build
```

Isso irá:

Construir as imagens do frontend, backend e worker.

Subir os serviços de MongoDB e RabbitMQ/Redis.

Disponibilizar a aplicação completa.

### 5. Acessar a aplicação

*   Frontend: [http://localhost:5173](http://localhost:5173)

*   Backend API: [http://localhost:3000](http://localhost:3000)

*   RabbitMQ Management (se habilitado): [http://localhost:15672](http://localhost:15672)

### 6. Fluxo de uso

1. Crie um usuário comum ou admin via tela de cadastro/login.

2. Faça login para acessar o Dashboard protegido.

3. Explore as funcionalidades:

*    CRUD de usuários

     Admin pode apagar qualquer usuário

     Usuário comum só pode apagar a própria conta

*    Lista de Pokémons com popup de detalhes

*    Dashboard de clima com dados coletados pelo worker Go

*    Exportação de dados em CSV/XLSX