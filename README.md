
# 🌦️ Weather Intelligence Platform  
### Sistema completo de Coleta, Processamento, Análise e Visualização de Dados Climáticos  
**Stack:** Python • Go • RabbitMQ • NestJS • MongoDB • React • Vite • Tailwind • shadcn/ui • Docker Compose • IA

---

### Vídeo demostrativo ###
>https://youtu.be/7ZB1MK9D63g

---

# 🚀 Sobre o Projeto

Este projeto é uma plataforma moderna de inteligência climática, construída com arquitetura distribuída e múltiplas linguagens, totalmente orquestrada em Docker Compose.

Ele foi desenvolvido para demonstrar domínio em:

- Integração entre serviços
- Processamento assíncrono
- Multi-linguagem
- Coleta de dados reais
- Full-stack moderno
- IA aplicada a dados reais

---

# 🧩 Arquitetura Geral

```
Python Producer → RabbitMQ → Go Worker → NestJS API → MongoDB → React Dashboard
```

### ✔ Python  
Coleta temperatura e envia para a fila.

### ✔ RabbitMQ  
Garante envio assíncrono entre serviços.

### ✔ Go Worker  
Processa mensagens da fila e envia para API.

### ✔ NestJS + MongoDB  
API REST que salva dados e expõe endpoints de consulta.

### ✔ React + Vite + Tailwind + shadcn/ui  
Dashboard moderno exibindo:

- Clima atual  
- Registro histórico real do backend  
- Gráfico de temperaturas  
- Insights gerados por IA  

---

# 🧠 Inteligência Artificial

A aba **Insights** gera textos dinâmicos com IA usando:

- Logs reais do backend  
- Clima atual  
- Tendências de temperatura  
- Horários de picos  
- Anomalias detectadas  

Insights são criados **no frontend**, sem alterar o backend.

---

# 📦 Estrutura do Projeto

```
weather-challenge/
│
├── docker-compose.yml
├── nestjs/        → API + Mongo
├── python/        → Coletor climático
├── go/            → Worker da fila
├── frontend/      → Dashboard React
└── README.md
```

---

# 🐳 Como Rodar com Docker (funciona de 1ª)

### **1️⃣ Subir tudo**
```
docker compose up --build
```

### **2️⃣ Acessar frontend**
```
http://localhost:5173
```

### **3️⃣ API NestJS**
```
http://localhost:3000/api/weather/logs
```

### **4️⃣ RabbitMQ Dashboard**
```
http://localhost:15672
Usuário: guest
Senha: guest
```

### **5️⃣ MongoDB**
Executando no container `mongo:6`.

---

# 🖥️ Funcionalidades

### ✔ Coleta automática de dados climáticos (Open-Meteo)  
### ✔ Envio periódico para fila RabbitMQ  
### ✔ Worker Go consumindo mensagens  
### ✔ API NestJS salvando no MongoDB  
### ✔ Dashboard elegante em shadcn/ui  
### ✔ Gráfico de temperatura por hora (Recharts)  
### ✔ Histórico real da base Mongo  
### ✔ Insights gerados por IA  
### ✔ Responsivo e com tema claro/escuro  


---


# 👨‍💻 Autor  
**Luiz Menezes**
LinkedIn: https://www.linkedin.com/in/**coloque-seu-user**
