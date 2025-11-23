# Placeholder para a API NestJS

Este diretório conterá a API backend em NestJS.

## Estrutura Planejada

```
api/
├── src/
│   ├── main.ts                 # Entry point
│   ├── app.module.ts           # Root module
│   ├── auth/                   # Autenticação JWT
│   ├── users/                  # CRUD de usuários
│   ├── weather/                # Weather logs + insights
│   │   ├── weather.controller.ts
│   │   ├── weather.service.ts
│   │   ├── weather.module.ts
│   │   ├── dto/
│   │   └── schemas/
│   ├── insights/               # Serviço de IA (Groq)
│   ├── common/                 # Guards, pipes, filters
│   └── config/                 # Configurações
├── Dockerfile
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## Responsabilidades

- Receber dados do worker Go
- Armazenar no MongoDB
- Gerar insights com Groq + Llama 3
- Cachear insights (1h)
- CRUD de usuários + JWT
- Export CSV/XLSX
- REST API para o frontend
