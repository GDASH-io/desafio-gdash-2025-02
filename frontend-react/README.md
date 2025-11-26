# Frontend React - GDASH Challenge

Frontend desenvolvido com React + Vite + TypeScript, Tailwind CSS e componentes reutilizáveis.

## 🚀 Tecnologias

- **React 19** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **Chart.js** + **react-chartjs-2** - Gráficos
- **React Hook Form** + **Zod** - Formulários e validação

## 📦 Instalação

```bash
npm install
```

## 🔧 Configuração

Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Edite `.env`:
```
VITE_API_URL=http://localhost:3000/api/v1
```

## 🏃 Execução

### Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Build de Produção

```bash
npm run build
```

### Preview do Build

```bash
npm run preview
```

## 📁 Estrutura do Projeto

```
frontend-react/
├── src/
│   ├── app/
│   │   ├── api.ts          # Configuração Axios
│   │   └── routes.tsx       # Rotas da aplicação
│   ├── components/
│   │   ├── ui/             # Componentes UI base
│   │   ├── Chart/          # Componentes de gráficos
│   │   ├── Layout.tsx      # Layout principal
│   │   └── PrivateRoute.tsx # Rota protegida
│   ├── contexts/
│   │   └── AuthContext.tsx  # Context de autenticação
│   ├── hooks/
│   │   └── usePolling.ts   # Hook para polling
│   ├── pages/
│   │   ├── Auth/           # Login e Register
│   │   ├── Dashboard/      # Dashboard principal
│   │   ├── Records/        # Tabela de registros
│   │   └── Users/          # CRUD de usuários
│   ├── utils/
│   │   └── cn.ts           # Utilitário para classes CSS
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── Dockerfile
└── package.json
```

## 🔐 Autenticação

A aplicação usa JWT para autenticação. O token é armazenado no `localStorage` e adicionado automaticamente nas requisições via interceptor do Axios.

### Usuário Padrão

- **Email:** `admin@example.com`
- **Senha:** `123456`

## 📊 Funcionalidades

### Dashboard
- Cards com métricas em tempo real (Temperatura, Umidade, Vento, Irradiância, PV Derating)
- Gráfico de temperatura e irradiância ao longo do tempo
- Atualização automática a cada 30 segundos (polling)

### Registros
- Tabela paginada com histórico de dados climáticos
- Filtros por período (data inicial e final)
- Exportação em CSV e XLSX

### Usuários (Admin)
- Listagem de usuários
- Criação de novos usuários
- Edição de usuários existentes
- Exclusão de usuários

## 🧪 Testes

O projeto utiliza Vitest para testes unitários.

```bash
# Executar testes
npm run test

# Executar testes com UI
npm run test:ui
```

### Estrutura de Testes

- `src/test/setup.ts` - Configuração global dos testes
- `src/pages/**/*.test.tsx` - Testes de componentes e páginas

### Exemplo de Teste

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Login from './Login';

describe('Login', () => {
  it('renders login form', () => {
    render(<Login />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });
});
```

## 🐳 Docker

### Build

```bash
docker build -t gdash-frontend .
```

### Run

```bash
docker run -p 5173:80 gdash-frontend
```

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa ESLint

## 🔗 Endpoints da API

A aplicação consome os seguintes endpoints:

- `POST /auth/login` - Login
- `POST /auth/register` - Registro
- `GET /weather/logs` - Lista de registros (com paginação)
- `GET /weather/logs/latest` - Último registro
- `GET /weather/export.csv` - Export CSV
- `GET /weather/export.xlsx` - Export XLSX
- `GET /users` - Lista usuários (admin)
- `POST /users` - Cria usuário (admin)
- `PUT /users/:id` - Atualiza usuário (admin)
- `DELETE /users/:id` - Remove usuário (admin)

## 🎨 Design System

O projeto utiliza uma paleta de cores baseada em HSL com suporte a modo claro/escuro. Os componentes seguem o padrão shadcn/ui.

## 📱 Responsividade

A aplicação é mobile-first e responsiva, utilizando breakpoints do Tailwind CSS:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## 🔒 Segurança

- Rotas protegidas com JWT
- Token armazenado no localStorage
- Interceptor Axios para adicionar token automaticamente
- Redirecionamento automático em caso de 401

## 🐛 Troubleshooting

### Erro de CORS

Certifique-se de que a API NestJS está configurada para aceitar requisições do frontend.

### Token expirado

O interceptor do Axios redireciona automaticamente para `/login` em caso de 401.

### Dados não aparecem

Verifique se:
1. A API está rodando em `http://localhost:3000`
2. O token está sendo enviado corretamente
3. Os endpoints estão retornando dados no formato esperado
