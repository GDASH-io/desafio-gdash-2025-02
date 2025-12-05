# GDASH Weather – Projeto Full‑Stack com Pipeline Python → Go → NestJS → MongoDB → React

Este repositório contém a solução completa desenvolvida para o **Desafio GDASH 2025/02**, atendendo todos os requisitos obrigatórios e opcionais solicitados. A aplicação implementa uma arquitetura distribuída moderna, integra múltiplas linguagens e serviços, utiliza IA para geração de insights climáticos e disponibiliza um dashboard completo com dados reais da minha cidade.

---

# 🚀 Visão Geral do Projeto
Este sistema coleta dados de clima reais via **OpenWeather**, envia para uma **fila RabbitMQ**, processa com um **worker em Go**, armazena via **API NestJS** no **MongoDB**, e exibe tudo em um **Dashboard React + Vite + Tailwind + shadcn/ui**.

Além disso, o sistema:
- Gera **insights automáticos de IA**;
- Exporta dados em **CSV** e **XLSX**;
- Possui **CRUD de usuários com autenticação JWT**;
- Inclui página opcional integrada à **PokéAPI** com paginação;
- Funciona 100% via **Docker Compose**.

---

# 🧩 Arquitetura Geral
A arquitetura segue o pipeline:

```
Python (coleta clima)
   → RabbitMQ (fila de mensagens)
      → Worker Go (consumo + validação)
         → API NestJS (armazenamento e IA)
            → MongoDB (base de dados)
               → Frontend React (dashboard)
```

Cada serviço possui responsabilidade única e comunicação clara entre camadas.

---

# 📁 Estrutura do Repositório
```
root/
│ backend/              → NestJS API
│ frontend/             → React + Vite + Tailwind + shadcn/ui
│ collector-python/     → Serviço Python que coleta clima
│ worker-go/            → Worker Go que consome fila
│ docker-compose.yml    → Orquestra todos os serviços
│ .env.example          → Variáveis de ambiente
```

---

# 🐍 1. Serviço Python — Coleta de Dados Climáticos
O serviço Python executa periodicamente e:

- Coleta dados via **OpenWeather**;
- Normaliza temperatura, umidade, vento e condição;
- Publica JSON na fila RabbitMQ.

### Como rodar (fora do Docker)
```
cd collector-python
pip install -r requirements.txt
python main.py
```

### JSON enviado para a fila
```json
{
  "temperature": 25.1,
  "humidity": 69,
  "wind_speed": 10.8,
  "condition": "Clouds",
  "city": "Itajaí, BR",
  "timestamp": "2025-12-05T16:58:00"
}
```

---

# 🟦 2. Fila & Worker — Go + RabbitMQ
O worker em Go:

- Lê mensagens da fila;
- Valida estrutura JSON;
- Reenvia para o endpoint NestJS `/api/weather/logs`;
- Registra logs e `ack`.

### Como rodar manualmente
```
cd worker-go
go mod tidy
go run main.go
```

---

# 🟧 3. Backend — NestJS + MongoDB
A API centraliza toda a lógica do sistema.

## Funcionalidades implementadas
### ✔ Recebimento de dados da fila
`POST /api/weather/logs`

### ✔ Listagem de registros
`GET /api/weather/logs`

### ✔ Exportação CSV/XLSX
- `GET /api/weather/export.csv`
- `GET /api/weather/export.xlsx`

### ✔ Insights de IA
`GET /api/weather/insights`

Alguns insights implementados:
- Tendência de temperatura (subindo/estável/caindo)
- Índice de conforto climático (0–100)
- Classificação do dia
- Resumo textual automático

### ✔ CRUD de usuários
- `POST /api/users`
- `GET /api/users`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`

### ✔ Autenticação JWT
- `POST /api/auth/login`

### ✔ Usuário padrão criado automaticamente
```
Email: admin@gdash.com
Senha: admin123
```

---

# 🟩 4. Frontend — React + Vite + Tailwind + shadcn/ui
A interface foi construída conforme o desafio, incluindo:

## 🌦 Dashboard Climático
Exibe:
- Temperatura atual
- Umidade
- Velocidade do vento
- Condição do clima
- Gráficos
- Tabela completa
- Botões CSV/XLSX
- Insights de IA com visual moderno e dinâmico

## 👤 CRUD de Usuários
- Tabela com usuários
- Criar, editar e remover
- Tela de login
- Rotas protegidas com JWT

## 🌐 Página opcional — PokéAPI
- Paginação
- Listagem
- Detalhe de Pokémon

---

# 🐳 Docker Compose
Todo o sistema sobe com **um único comando**.

### 📦 Serviços no docker-compose.yml
- backend (NestJS)
- frontend (React)
- collector (Python)
- worker (Go)
- mongodb
- rabbitmq

### Como iniciar tudo
```
docker-compose up --build
```

### Endpoints principais
| Serviço | URL |
|--------|-----|
| Frontend | http://localhost:5173 |
| API NestJS | http://localhost:3000 |
| Swagger | http://localhost:3000/api |
| RabbitMQ UI | http://localhost:15672 |
| MongoDB | mongodb://localhost:27017 |

---

# 🔐 Usuário padrão
```
Email: admin@gdash.com
Senha: 123456
```

---

# ▶️ Vídeo Explicativo
O vídeo obrigatório do desafio está disponível em:

🔗 **YouTube (não listado):** https://www.youtube.com/watch?v=b90NRAWPEZE

O vídeo demonstra:
- Arquitetura
- Pipeline completo Python → Go → Nest → Frontend
- IA funcionando
- Exportações CSV/XLSX
- CRUD de usuário
- Dashboard final

---

# 📦 Variáveis de Ambiente (.env.example)
```
MONGO_URI=mongodb://mongodb:27017/gdash
JWT_SECRET=supersecret
OPENWEATHER_API_KEY=SUA_CHAVE
RABBIT_URL=amqp://guest:guest@rabbitmq:5672/
FRONTEND_URL=http://localhost:5173
```

---

# 🧪 Checklist de requisitos atendidos
☑ Python coleta clima da OpenWeather
☑ Python envia para RabbitMQ
☑ Worker Go consome fila e envia para NestJS
☑ NestJS salva no MongoDB
☑ NestJS expõe CSV/XLSX
☑ NestJS gera insights de IA
☑ CRUD de usuários com auth JWT
☑ Página opcional com API paginada (PokéAPI)
☑ Frontend completo com dashboard
☑ Docker compose sobe tudo
☑ Documentação completa
☑ Vídeo enviado

---

# 🧠 Decisões Técnicas Importantes
- Utilizei **OpenWeather** por oferecer mais métricas úteis.
- IA implementada diretamente no backend para centralizar regras.
- Worker Go simples e eficiente, com retry básico.
- Tailwind + shadcn/ui para UI moderna e rápida.
- Repositório modular, serviços independentes e bem organizados.

---

# 📚 Como contribuir
1. Crie uma branch com seu nome completo.
2. Envie um Pull Request.

---

# 🏁 Conclusão
Este projeto demonstra integração entre múltiplas linguagens, serviços distribuídos, IA aplicada, UX moderna e um pipeline de dados completo — exatamente o que o desafio GDASH pede.

Caso deseje, posso gerar também:
- fluxograma
- diagrama arquitetural
- documentação Swagger
- prints organizados
- versão PDF do README

Basta pedir! 🚀

