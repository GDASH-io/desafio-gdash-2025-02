# Desafio para o processo seletivo GDASH 2025/02

> **Candidato**: Cesar da Silva Braz  
> **Branch**: `cesar-da-silva-braz`  

Sistema fullstack de monitoramento climático em tempo real com insights gerados por IA, utilizando arquitetura de microsserviços.

---

## 📹 Vídeo Demonstrativo

🎥 **[Link do vídeo no YouTube (não listado)]** - _Em breve_

---

## 🏗️ Arquitetura

```
Python (Collector) → RabbitMQ → Go (Worker) → NestJS (API) → React (Frontend)
                                                    ↓
                                               MongoDB
                                                    ↓
                                            Groq + Llama 3 (IA)
```

### Stack Técnico

**Backend**:
- NestJS (TypeScript) - API REST + Orquestração
- MongoDB - Banco de dados NoSQL
- RabbitMQ - Message broker
- Groq API - LLM para insights (Llama 3.1 70B)

**Coleta & Processamento**:
- Python - Scheduler para coleta de dados climáticos
- Go - Worker de alta performance para consumir fila

**Frontend**:
- React 18 + Vite
- Tailwind CSS + shadcn/ui
- Recharts para gráficos

**Infraestrutura**:
- Docker & Docker Compose

### Estrutura do Monorepo

```
desafio-gdash-2025-02/
├── services/
│   ├── weather-collector/    # Python - Coleta Open-Meteo
│   ├── queue-worker/          # Go - Consome RabbitMQ
│   ├── api/                   # NestJS - Backend + IA
│   └── frontend/              # React + Vite + shadcn/ui
├── docs/
│   ├── architecture.md        # Arquitetura detalhada
│   └── schemas.md             # Schemas de comunicação
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- **Docker Desktop** instalado e rodando
- Conta **Groq** (gratuita): https://console.groq.com/keys

### 🎯 Setup Automático (Recomendado)

#### Windows:
```bash
.\setup.bat
```

#### Linux/Mac:
```bash
chmod +x setup.sh
./setup.sh
```

O script irá:
1. Criar o arquivo `.env` a partir do `.env.example`
2. Solicitar que você configure a `GROQ_API_KEY`
3. Subir todos os serviços Docker automaticamente

### ⚙️ Setup Manual

1. **Clone o repositório**:
```bash
git clone https://github.com/CesarBraz7/desafio-gdash-2025-02.git
cd desafio-gdash-2025-02
git checkout cesar-da-silva-braz
```

2. **Configure as variáveis de ambiente**:
```bash
cp .env.example .env
```

3. **Adicione sua Groq API Key** no arquivo `.env`:
```env
GROQ_API_KEY=gsk_your_api_key_here
```

4. **Suba todos os serviços**:
```bash
docker-compose up -d
```

5. **Aguarde a inicialização** (~30-60 segundos)

### 🌐 Acessar a Aplicação

- **Frontend**: http://localhost:5173
- **API**: http://localhost:4000/api
- **API Health**: http://localhost:4000/api/health
- **RabbitMQ Management**: http://localhost:15672
  - Usuário: `gdash`
  - Senha: `gdash123`

### 🔐 Credenciais Padrão

**Login no sistema**:
- Email: `admin@example.com`
- Senha: `123456`

### 📝 Comandos Úteis

```bash
# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f frontend
docker-compose logs -f api
docker-compose logs -f weather-collector
docker-compose logs -f queue-worker

# Parar todos os serviços
docker-compose down

# Parar e remover volumes (dados do MongoDB)
docker-compose down -v

# Reiniciar um serviço específico
docker-compose restart api

# Rebuild e restart de todos os serviços
docker-compose up -d --build
```

---

## ✅ Checklist rápido

- [x] Python coleta dados de clima (Open-Meteo ou OpenWeather)  
- [x] Python envia dados para a fila  
- [x] Worker Go consome a fila e envia para a API NestJS  
- [x] API NestJS:
  - [x] Armazena logs de clima em MongoDB  
  - [x] Exponde endpoints para listar dados  
  - [x] Gera/retorna insights de IA (endpoint próprio)  
  - [x] Exporta dados em CSV/XLSX  
  - [x] Implementa CRUD de usuários + autenticação  
  - [ ] (Opcional) Integração com API pública paginada  
- [x] Frontend React + Vite + Tailwind + shadcn/ui:
  - [x] Dashboard de clima com dados reais  
  - [x] Exibição de insights de IA  
  - [x] CRUD de usuários + login  
  - [ ] (Opcional) Página consumindo API pública paginada  
- [x] Docker Compose sobe todos os serviços  
- [x] Código em TypeScript (backend e frontend)  
- [ ] Vídeo explicativo (máx. 5 minutos)  
- [x] Pull Request via branch com seu nome completo  
- [x] README completo com instruções de execução  
- [x] Logs e tratamento de erros básicos em cada serviço  

---

---

## 📖 Documentação Adicional

- **[Arquitetura Detalhada](./docs/architecture.md)** - Decisões técnicas e justificativas
- **[Schemas de Comunicação](./docs/schemas.md)** - Contratos JSON entre serviços

---

## 🧪 Desenvolvimento

### 🐳 Modo Docker (Recomendado)

O `docker-compose.yml` está configurado para desenvolvimento com hot-reload em todos os serviços:

```bash
# Desenvolvimento com hot reload
docker-compose up

# Desenvolvimento em background
docker-compose up -d

# Rebuild após mudanças no Dockerfile ou dependências
docker-compose up --build
```

### 💻 Modo Local (Sem Docker)

Para desenvolvimento local sem Docker, você precisa ter instalado:
- Node.js 20+
- Python 3.11+
- Go 1.21+
- MongoDB rodando localmente
- RabbitMQ rodando localmente

**1. Configure cada serviço**:

Cada serviço tem seu próprio `.env.example`. Copie para `.env` e configure:

```bash
# API
cd services/api
cp .env.example .env
npm install

# Frontend
cd services/frontend
cp .env.example .env
npm install

# Weather Collector
cd services/weather-collector
cp .env.example .env
pip install -r requirements.txt

# Queue Worker
cd services/queue-worker
cp .env.example .env
go mod download
```

**2. Rode cada serviço em um terminal separado**:

```bash
# Terminal 1 - API
cd services/api
npm run start:dev

# Terminal 2 - Frontend
cd services/frontend
npm run dev

# Terminal 3 - Weather Collector
cd services/weather-collector
python src/main.py

# Terminal 4 - Queue Worker
cd services/queue-worker
go run cmd/worker/main.go
```

### 🏭 Produção

Para build de produção:

```bash
# Build otimizado
docker-compose -f docker-compose.prod.yml up -d --build

# Ou especifique NODE_ENV=production
NODE_ENV=production docker-compose up -d --build
```

---

## 📝 Decisões Técnicas

### Por que Open-Meteo?
- ✅ Gratuito sem API key
- ✅ Dados históricos e previsão
- ✅ Sem rate limits restritivos

### Por que Groq + Llama 3?
- ✅ 100% gratuito (tier generoso)
- ✅ Inferência ultra-rápida (~1-2s)
- ✅ Modelo potente (70B parâmetros)

### Por que Go para o Worker?
- ✅ Alta performance e concorrência nativa
- ✅ Excelentes bibliotecas para RabbitMQ

### Por que shadcn/ui?
- ✅ Componentes customizáveis e acessíveis
- ✅ Integração perfeita com Tailwind

---

## 🐛 Troubleshooting

**Erro ao conectar no MongoDB**:
```bash
docker-compose restart mongodb
```

**RabbitMQ não está saudável**:
```bash
docker-compose logs rabbitmq
docker-compose restart rabbitmq
```

**Frontend não conecta na API**:
Verifique se `VITE_API_URL` no `.env` está correto.

---

## 📞 Contato

**Cesar da Silva Braz**
- GitHub: [@CesarBraz7](https://github.com/CesarBraz7)
- LinkedIn: [in/cesardsbraz](https://www.linkedin.com/in/cesardsbraz/)


