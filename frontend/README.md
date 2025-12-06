# Weather Dashboard - Frontend

Dashboard React para visualização de dados climáticos em tempo real.

## 🚀 Tecnologias

- **React 18** com TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **Recharts** - Gráficos
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **date-fns** - Manipulação de datas

## 📦 Instalação

```bash
cd frontend
npm install
```

## 🏃 Executar Localmente

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

A aplicação estará disponível em `http://localhost:5173`

## 🎨 Funcionalidades

### Dashboard
- **Cards Principais**: Temperatura, Umidade, Velocidade do Vento, Condição
- **Gráficos**: 
  - Temperatura ao longo do tempo (Line Chart)
  - Probabilidade de chuva (Bar Chart)
- **Tabela de Registros**: Últimos registros climáticos
- **Exportação**: Botões para exportar CSV e XLSX
- **Insights de IA**: 
  - Resumo descritivo
  - Pontuação de conforto (0-100)
  - Classificação do dia
  - Alertas climáticos
  - Recomendações

### Autenticação
- Tela de login
- Rotas protegidas
- Gerenciamento de token JWT

## 🔧 Configuração

O frontend está configurado para fazer proxy das requisições `/api` para `http://localhost:3000` durante o desenvolvimento.

No Docker, o nginx faz proxy para o serviço `api`.

## 📱 Estrutura

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/          # Componentes shadcn/ui
│   │   └── ProtectedRoute.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   └── Dashboard.tsx
│   ├── services/
│   │   ├── api.ts       # Configuração do Axios
│   │   ├── auth.ts      # Serviço de autenticação
│   │   └── weather.ts   # Serviço de dados climáticos
│   ├── lib/
│   │   └── utils.ts     # Utilitários
│   ├── App.tsx
│   └── main.tsx
├── public/
└── package.json
```

## 🐳 Docker

O frontend está configurado para rodar em Docker com nginx:

```bash
docker-compose up frontend
```

Acesse em `http://localhost`

