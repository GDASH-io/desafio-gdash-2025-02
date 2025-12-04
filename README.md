# 🌤️ Skify – Sistema de Coleta, Processamento e Visualização de Dados Climáticos

Aplicação full-stack responsável por coletar, processar e exibir informações climáticas em tempo real utilizando uma arquitetura distribuída com múltiplos serviços.

---

## 📌 Arquitetura Geral

A aplicação funciona como uma pipeline completa, onde cada serviço possui uma função clara e independente.

---

## 🐍 1. Python – Coletor de Dados Climáticos

O serviço em Python acessa a **API Open-Meteo** para coletar dados como:

- Temperatura  
- Umidade  
- Velocidade do vento  
- Probabilidade de precipitação  

Após coletar os dados, o serviço envia tudo para a fila do **RabbitMQ**.

---

## 📬 2. RabbitMQ – Fila de Mensagens

Sistema de mensageria responsável por:

- Receber as mensagens geradas pelo Python  
- Armazenar até que sejam consumidas  
- Entregar para o Worker Go em tempo real  

---

## ⚙️ 3. Worker Go – Processador de Mensagens

O Worker fica escutando a fila continuamente.  
Para cada nova mensagem recebida:

1. Lê os dados climáticos enviados pelo Python  
2. Formata e valida  
3. Envia para o backend NestJS  
4. O backend salva no banco e disponibiliza nas APIs

---

## 🏛️ 4. Backend NestJS – API e Processamento

Responsável por:

### 🔐 Autenticação e Usuários
- Login  
- Cadastro  
- JWT  

### 🌦️ Dados Climáticos
Rotas principais:

#### `GET /api/weather/logs`
Retorna todos os registros climáticos armazenados.

#### `GET /api/weather/export.csv`
Exporta os registros climáticos em formato CSV.

#### `GET /api/weather/export.xlsx`
Exporta os registros em formato Excel (XLSX).

#### `GET /api/weather/insights`
Gera e retorna insights de IA baseados nos dados já salvos.

O backend também recebe os dados enviados pelo Worker Go e os salva no **MongoDB**.

---

## 🗄️ 5. MongoDB – Banco de Dados

Armazena:

- Logs climáticos  
- Usuários cadastrados  

Ideal para manipular dados dinâmicos como registros de clima.

---

## 🖥️ 6. Frontend – React + Vite + Tailwind

Interface moderna e responsiva, com:

- Tela de login  
- Dashboard com estatísticas  
- Gráficos do clima  
- Visualização de registros  
- Insights gerados por IA  
- Rotas protegidas  
- Páginas administrativas (Usuários e Clima)

---

# 🌦️ Weather App - Arquitetura Completa

Este projeto integra múltiplos serviços (Python, Go, NestJS, Frontend e RabbitMQ) para coleta, processamento e visualização de dados climáticos.

---

## 🚀 Como rodar tudo via Docker Compose

- Para iniciar toda a aplicação:

```bash
docker compose up --build
```

- Para consultar o OpenMeteo e enviar pro Rabbit e mongo

```Rodar o weather_collector.py```

- Para enviar os dados para o NestJS

```bash
cd go-worker
go run main.go
```

- Para rodar o front-end

```bash
cd frontend
npm run dev
```

- Usuário padrão

E-mail: usuario@email.com
Senha: 123456

## 🌐 URLs principais da aplicação
Frontend	http://localhost:5173
API NestJS	http://localhost:3000 (api/weather/logs) (api/users) (api/weather/insights)


## 📹 Video do projeto 
[Veja](https://youtu.be/tWO6pPJqY0Y)




