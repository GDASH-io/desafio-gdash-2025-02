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

- Docker & Docker Compose instalados
- Conta Groq (gratuita): https://console.groq.com

### Passo a Passo

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

Edite o arquivo `.env` e adicione sua **Groq API Key**:
```env
GROQ_API_KEY=gsk_your_api_key_here
```

3. **Suba todos os serviços**:
```bash
docker-compose up -d
```

4. **Aguarde a inicialização** (~30-60 segundos)

5. **Acesse a aplicação**:
   - **Frontend**: http://localhost:3000
   - **API**: http://localhost:4000
   - **RabbitMQ Management**: http://localhost:15672 (usuário: `gdash`, senha: `gdash123`)

### Credenciais Padrão

**Login no sistema**:
- Email: `admin@example.com`
- Senha: `123456`

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

---

## 📖 Documentação Adicional

- **[Arquitetura Detalhada](./docs/architecture.md)** - Decisões técnicas e justificativas
- **[Schemas de Comunicação](./docs/schemas.md)** - Contratos JSON entre serviços

---

## 🧪 Desenvolvimento

### Rodar serviços individualmente

**API (NestJS)**:
```bash
cd services/api
npm install
npm run start:dev
```

**Frontend (React)**:
```bash
cd services/frontend
npm install
npm run dev
```

**Weather Collector (Python)**:
```bash
cd services/weather-collector
pip install -r requirements.txt
python src/main.py
```

**Queue Worker (Go)**:
```bash
cd services/queue-worker
go run cmd/worker/main.go
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


