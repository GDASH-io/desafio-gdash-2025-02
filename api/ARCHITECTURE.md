# 🏗️ Arquitetura da API - Padrão MVC

## 📁 Estrutura de Pastas

```
api/src/
├── main.ts                    # Entry point da aplicação
├── app.module.ts              # Módulo raiz da aplicação
│
├── common/                    # Código compartilhado entre módulos
│   ├── exceptions/            # Exceções customizadas
│   │   └── business.exception.ts
│   ├── filters/               # Filtros de exceção
│   │   └── http-exception.filter.ts
│   ├── interceptors/          # Interceptors HTTP
│   │   └── transform.interceptor.ts
│   └── interfaces/            # Interfaces compartilhadas
│       └── api-response.interface.ts
│
├── config/                    # Configurações da aplicação
│   ├── app.config.ts          # Configurações gerais
│   ├── database.config.ts      # Configurações do MongoDB
│   └── jwt.config.ts          # Configurações JWT
│
├── weather/                   # Módulo de dados climáticos (MVC)
│   ├── controllers/           # Controladores (C)
│   │   └── weather.controller.ts
│   ├── services/              # Serviços de negócio (M)
│   │   └── weather.service.ts
│   ├── models/               # Modelos/Schemas (M)
│   │   └── schemas/
│   │       └── weather-log.schema.ts
│   ├── dto/                   # Data Transfer Objects
│   │   └── create-weather-log.dto.ts
│   └── weather.module.ts      # Módulo NestJS
│
├── users/                     # Módulo de usuários (MVC)
│   ├── controllers/
│   │   └── users.controller.ts
│   ├── services/
│   │   └── users.service.ts
│   ├── models/
│   │   └── schemas/
│   │       └── user.schema.ts
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   └── users.module.ts
│
├── auth/                      # Módulo de autenticação (MVC)
│   ├── controllers/
│   │   └── auth.controller.ts
│   ├── services/
│   │   └── auth.service.ts
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── register.dto.ts
│   ├── guards/                # Guards de autenticação
│   │   ├── jwt-auth.guard.ts
│   │   └── local-auth.guard.ts
│   ├── strategies/           # Estratégias Passport
│   │   ├── jwt.strategy.ts
│   │   └── local.strategy.ts
│   └── auth.module.ts
│
└── insights/                  # Módulo de insights com IA (MVC)
    ├── controllers/
    │   └── insights.controller.ts
    ├── services/
    │   └── insights.service.ts
    ├── dto/
    │   └── insights-response.dto.ts
    └── insights.module.ts
```

## 🎯 Padrão MVC no NestJS

### **Model (Modelo)**
- **Schemas**: Definem a estrutura dos dados no MongoDB (`schemas/`)
- **DTOs**: Validam e transferem dados entre camadas (`dto/`)
- **Interfaces**: Definem contratos de dados (`interfaces/`)

### **View (Visualização)**
- No NestJS, a "View" é representada pelas **respostas JSON** dos controllers
- O `TransformInterceptor` padroniza o formato das respostas
- Controllers retornam dados formatados para o cliente

### **Controller (Controlador)**
- Recebem requisições HTTP
- Validam dados de entrada (DTOs)
- Chamam serviços apropriados
- Retornam respostas formatadas
- Localizados em `controllers/`

### **Service (Serviço)**
- Contém a lógica de negócio
- Interage com o banco de dados
- Processa e transforma dados
- Localizados em `services/`

## 🔄 Fluxo de Requisição

```
Cliente HTTP Request
    ↓
Controller (valida DTO)
    ↓
Service (lógica de negócio)
    ↓
Model/Schema (acesso ao banco)
    ↓
Service (processa resultado)
    ↓
Controller (formata resposta)
    ↓
TransformInterceptor (padroniza)
    ↓
Cliente HTTP Response
```

## 📦 Módulos

Cada módulo segue a estrutura MVC:

1. **Module**: Configura dependências e exporta serviços
2. **Controller**: Endpoints HTTP
3. **Service**: Lógica de negócio
4. **Model/Schema**: Estrutura de dados
5. **DTO**: Validação de entrada/saída

## 🛡️ Camadas de Segurança

1. **Guards**: Protegem rotas (JWT, Local)
2. **Filters**: Tratam exceções globalmente
3. **Interceptors**: Transformam respostas
4. **Pipes**: Validam e transformam dados

## 📝 Boas Práticas Implementadas

✅ Separação de responsabilidades (SRP)  
✅ Injeção de dependências  
✅ Validação de dados com class-validator  
✅ Tratamento centralizado de exceções  
✅ Respostas padronizadas  
✅ Configurações centralizadas  
✅ Documentação com JSDoc  
✅ TypeScript para type safety  

