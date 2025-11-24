# Frontend - Dashboard Climático com IA

Interface moderna e responsiva construída com React 19, TypeScript, Vite 7 e shadcn/ui para visualização de dados climáticos em tempo real com insights gerados por IA.

---

## 🎨 Stack Tecnológico

### Core
- **React 19.2.0** - Biblioteca UI com hooks modernos
- **TypeScript 5.9.3** - Type safety e melhor DX
- **Vite 7.2.4** - Build tool ultra-rápida com HMR

### UI/UX
- **Tailwind CSS 4.1.17** - Utility-first CSS framework
- **shadcn/ui** - Componentes acessíveis e customizáveis baseados em Radix UI
- **Lucide React** - Ícones modernos e consistentes
- **Recharts 3.5.0** - Biblioteca de gráficos para visualização de dados

### Formulários & Validação
- **React Hook Form 7.66.1** - Gerenciamento de formulários performático
- **Zod 4.1.12** - Validação de schemas type-safe
- **@hookform/resolvers** - Integração RHF + Zod

### Roteamento & Estado
- **React Router DOM 7.9.6** - Roteamento declarativo
- **Axios 1.13.2** - Cliente HTTP com interceptors

---

## 🏗️ Arquitetura Frontend

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   ├── MetricCard.tsx  # Card de métricas climáticas
│   └── PrivateRoute.tsx # Rota protegida
│
├── contexts/           # Gerenciamento de estado global
│   └── AuthContext.tsx # Autenticação e usuário
│
├── hooks/              # Custom hooks
│   └── use-toast.ts    # Notificações toast
│
├── pages/              # Páginas da aplicação
│   ├── Dashboard.tsx   # Dashboard principal com dados climáticos
│   ├── Users.tsx       # CRUD de usuários
│   └── Login.tsx       # Página de autenticação
│
├── services/           # Clientes API
│   ├── api.ts         # Configuração Axios + interceptors
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── weather.service.ts
│   └── insights.service.ts
│
├── types/              # Definições TypeScript
│   ├── auth.types.ts
│   ├── user.types.ts
│   ├── weather.types.ts
│   └── insights.types.ts
│
├── lib/                # Utilitários
│   └── utils.ts        # Helpers (cn, etc)
│
├── App.tsx             # Componente raiz + rotas
└── main.tsx            # Entry point
```

---

## 🚀 Funcionalidades Implementadas

### 🔐 Autenticação
- Login com email e senha
- Proteção de rotas privadas
- Persistência de sessão (localStorage)
- Logout com limpeza de estado
- Interceptor Axios para tokens JWT
- Tratamento automático de 401 (redirecionamento para login)

### 📊 Dashboard Climático
**Métricas em Tempo Real (7 KPIs)**:
- 🌡️ Temperatura e sensação térmica
- 💧 Umidade relativa do ar
- 💨 Velocidade e direção do vento
- ☀️ Índice UV com classificação
- 🔵 Pressão atmosférica
- 👁️ Visibilidade
- 🌧️ Probabilidade de chuva

**Visualizações**:
- Gráfico de linha: Temperatura nas últimas 24h
- Gráfico de área: Umidade nas últimas 24h
- Tabela de registros recentes com 5 últimas leituras

**Estados**:
- Loading state com spinner animado
- Empty state com botão de retry
- Error handling com toasts informativos

**Ações**:
- 📥 Exportar dados em CSV
- 📥 Exportar dados em XLSX
- 🤖 Gerar insights de IA com contextos personalizados

### 🤖 AI Insights
**4 Tipos de Análise**:
- **Análise Geral**: Overview das condições meteorológicas
- **Alertas**: Identificação de condições extremas
- **Recomendações**: Sugestões práticas (vestuário, atividades)
- **Tendências**: Padrões nos dados históricos

**UX**:
- Loading state durante geração
- Card com design gradiente para exibição
- Timestamp de geração
- Contador de dados analisados

### 👥 CRUD de Usuários
**Funcionalidades Completas**:
- ✅ Listar todos os usuários (tabela responsiva)
- ✅ Criar novo usuário (Dialog modal)
- ✅ Editar usuário existente (Dialog com pré-preenchimento)
- ✅ Deletar usuário (Dialog de confirmação)

**Validações (Zod + RHF)**:
- Nome: mínimo 3 caracteres
- Email: formato válido
- Senha: mínimo 6 caracteres (apenas na criação)

**Feedback Visual**:
- Toasts de sucesso/erro para todas operações
- Loading states em botões
- Badges para roles (Admin/User)

### 🎨 Design System (shadcn/ui)
**Componentes Implementados**:
- Button (variants: default, destructive, outline, ghost)
- Card (Header, Content, Description, Footer)
- Dialog (Modal com overlay animado)
- Table (Responsiva com Header/Body/Row/Cell)
- Select (Dropdown customizado)
- Toast (Sistema de notificações)
- Badge (Labels coloridos)
- Input (Formulários)
- Label (Acessibilidade)
- Avatar (Foto de perfil com fallback)
- Separator (Divisores visuais)

**Temas**:
- Background gradiente (blue-50 to indigo-100)
- Cards com sombras sutis e backdrop blur
- Cores semânticas para estados (success, destructive)
- Animações suaves com Tailwind

---

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do frontend:

```env
VITE_API_URL=http://localhost:4000/api
```

### Interceptors Axios

O cliente HTTP possui interceptors configurados para:

1. **Request**: Adiciona token JWT automaticamente em todas requisições
2. **Response Error**: 
   - Captura erro 401 (não autorizado)
   - Limpa localStorage
   - Redireciona para /login
   - Exibe toast de erro

---

## 📱 Responsividade

- **Mobile First**: Design otimizado para dispositivos móveis
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grid Responsivo**: Ajuste automático de colunas
- **Tabelas**: Scroll horizontal em telas pequenas

---

## ⚡ Performance

- **Code Splitting**: Lazy loading de rotas
- **Tree Shaking**: Vite remove código não utilizado
- **Minificação**: Build otimizado para produção
- **Memoization**: useCallback e useMemo onde necessário

---

## 🧪 Desenvolvimento

### Adicionar novo componente shadcn/ui

Embora os componentes estejam copiados, você pode atualizar via:

```bash
npx shadcn@latest add [component-name]
```

### Estrutura de um Service

```typescript
// src/services/example.service.ts
import { api } from './api';
import type { ExampleType } from '../types/example.types';

export const exampleService = {
  async getAll(): Promise<ExampleType[]> {
    const response = await api.get<ExampleType[]>('/examples');
    return response.data;
  },
  
  async create(data: CreateExampleDto): Promise<ExampleType> {
    const response = await api.post<ExampleType>('/examples', data);
    return response.data;
  },
};
```

### Estrutura de um Type

```typescript
// src/types/example.types.ts
export interface ExampleType {
  id: string;
  name: string;
  createdAt: string;
}

export interface CreateExampleDto {
  name: string;
}
```

---

## 📚 Recursos

- [React 19 Docs](https://react.dev)
- [Vite Documentation](https://vite.dev)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [React Hook Form](https://react-hook-form.com)
- [Recharts](https://recharts.org)

---

## 🐛 Troubleshooting

**Erro de CORS**:
```bash
# Verifique se a API está rodando
# Confirme VITE_API_URL no .env
```

**Hot reload não funciona**:
```bash
# Reinicie o servidor de dev
npm run dev
```

**Build falha**:
```bash
# Limpe cache e reinstale
rm -rf node_modules dist
npm install
npm run build
```
