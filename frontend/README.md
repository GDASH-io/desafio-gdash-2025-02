# 🖥️ Frontend - Dashboard Climático & Gestão

Interface moderna, responsiva e de alto desempenho construída com **React 18+**, focada na visualização de dados em tempo real e numa experiência de utilizador fluida.

## 🎨 Stack Tecnológica

- **Core:** React 18+ (Vite)
- **Linguagem:** TypeScript
- **Estilização:** TailwindCSS v4
- **Componentes UI:** Shadcn/ui (Radix Primitives)
- **Gráficos:** Recharts
- **Ícones:** Lucide React
- **HTTP Client:** Axios (com Interceptors)
- **Feedback:** Sonner (Toasts)
- **Gestão de Formulários:** React Hook Form + Zod

## 🧩 Arquitetura do Frontend

O projeto utiliza o padrão de **Custom Hooks** para separar completamente a lógica de negócio da camada de apresentação (View/JSX).

### Estrutura de Diretórios

```
src/
├── components/
│   ├── ui/             # Componentes base do Shadcn (Button, Card, Input...)
│   └── ...
├── layouts/            # Layouts globais (MainLayout com Sidebar e Header)
├── lib/                # Configurações globais (Axios instance, Utils)
├── pages/
│   ├── Dashboard/
│   │   ├── components/ # Componentes exclusivos (Charts, Tables, Cards)
│   │   ├── hooks/      # useDashboard.ts (Toda a lógica e estado)
│   │   └── Dashboard.tsx (Apenas JSX/Visual)
│   ├── Users/
│   │   ├── components/ # Modais e Tabelas modulares
│   │   ├── hooks/      # useUsers.ts (Lógica de CRUD e Filtros)
│   │   └── UsersManager.tsx
│   ├── StarWars/       # Integração com API externa
│   │   └── ...
│   └── Login/
└── services/           # Camada de API (Axios calls para o Backend NestJS)

```

## ✨ Funcionalidades Principais

### 1. Dashboard Inteligente (`/`)

- **Visualização de Dados:** Gráficos interativos alternáveis entre Temperatura, Umidade, Vento e Probabilidade de Chuva.
- **AI Insights Card:** Exibe análises geradas pelo Gemini com destaque visual para a previsão numérica da próxima hora.
- **Auto-Refresh:** Atualização automática dos dados a cada 30 minutos, com opção de atualização manual instantânea.
- **Exportação:** Download direto de relatórios em `.csv` e `.xlsx`.

### 2. Gestão de Usuários (CRUD) (`/users`)

- **Filtragem Client-Side:** Busca instantânea e reativa por texto (e-mail), permissão (role) e data de criação.
- **Modais Modulares:** Formulários de criação/edição (`UserFormDialog`) e confirmação de exclusão (`UserDeleteDialog`) segregados para limpeza de código.
- **Validação Robusta:** Zod schema validation que adapta regras dinamicamente (ex: senha obrigatória na criação, opcional na edição).

### 3. Integração Externa (`/star-wars`)

- Consumo de API externa (SWAPI) via proxy do backend.
- Paginação server-side e modal de detalhes reutilizável.

## 🔧 Componentes de Destaque

### `RainChart.tsx`

Gráfico de área customizado com gradiente `cyan`, utilizando `recharts` e tooltip personalizado para visualizar a probabilidade de chuva.

### `AiInsightCard.tsx`

Componente inteligente que gerencia múltiplos estados visuais:

- **Loading:** Loading informativo com animação pulsante.
- **Empty:** Estado amigável quando não há dados suficientes.
- **Data:** Exibe temperatura prevista com formatação numérica (`toFixed`) e alertas contextuais.

### `useUsers.ts` (Custom Hook)

Centraliza toda a complexidade da página de gestão:

- Estado da lista e do loading.
- Lógica de filtragem combinada (Search + Role + Date).
- Controle de abertura/fechamento de modais.
- Funções de CRUD (Create, Update, Delete) com feedback visual (Toasts).
