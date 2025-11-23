# Placeholder para o Frontend React

Este diretório conterá o frontend em React + Vite.

## Estrutura Planejada

```
frontend/
├── src/
│   ├── main.tsx                # Entry point
│   ├── App.tsx                 # Root component
│   ├── components/             # Componentes reutilizáveis
│   │   └── ui/                 # shadcn/ui components
│   ├── pages/                  # Páginas/rotas
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   └── Users.tsx
│   ├── services/               # API clients
│   ├── hooks/                  # Custom hooks
│   ├── lib/                    # Utilities
│   ├── types/                  # TypeScript types
│   └── styles/                 # Global styles
├── public/
├── Dockerfile
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── components.json             # shadcn/ui config
└── tsconfig.json
```

## Responsabilidades

- Dashboard com dados climáticos em tempo real
- Gráficos (Recharts)
- Cards com métricas
- Insights de IA formatados
- Autenticação JWT
- CRUD de usuários
- Export CSV/XLSX
- UI/UX com shadcn/ui
