-----

# 🚀 GDASH Monitor - Sistema Climático Distribuído

### Repositório para o Processo Seletivo GDASH 2025/02

Este projeto implementa uma **Arquitetura de Microsserviços Full Stack** altamente integrada para coleta, processamento, análise e visualização de dados climáticos em tempo real.

-----

## 🎥 1. Vídeo de Apresentação Técnica

Assista ao vídeo para uma demonstração do pipeline de dados, da arquitetura e das principais decisões técnicas:

[link para o vídeo](https://youtu.be/Z-3xPj7SAhY)

-----

## 🧭 2. Arquitetura e Pipeline de Dados

O sistema é composto por 6 serviços, orquestrados pelo **Docker Compose**. O fluxo é totalmente assíncrono, garantindo resiliência e alto desempenho.

| Serviço | Tecnologia | Responsabilidade |
| :--- | :--- | :--- |
| **Coletor** | Python + Requests | Faz a coleta de dados e aplica correções de **fuso horário** e **probabilidade de chuva** |
| **Broker** | RabbitMQ | Fila de Mensagens (Garante a durabilidade dos eventos). |
| **Worker** | Go (Golang) | Consumo de alta performance, implementa **QoS** (Flow Control) e envia POST para o Backend. |
| **Backend** | NestJS + MongoDB | API, Autenticação **JWT/Bcrypt**, Lógica de **IA (Heurística)** e CRUD. |
| **Frontend** | React + NGINX | Dashboard interativo, servido pelo NGINX para otimização de performance. |

-----

## 💡 3. Principais Decisões Técnicas (Diferenciais)

As escolhas abaixo demonstram foco em performance e estabilidade, superando as exigências do desafio:

| Categoria | Decisão | Benefício |
| :--- | :--- | :--- |
| **Arquitetura** | **Multi-stage Build + NGINX** | Imagens Docker minúsculas (Worker Go/React) e máxima velocidade na entrega do Frontend (via NGINX). |
| **Segurança** | **Guarda de Exclusão de Admin** | O `UsersService` impede a deleção do usuário padrão, prevenindo a perda de acesso crítico (Soft Lock). |
| **Data Integrity** | **Correção WMO Code** | Lógica no Python que prioriza o código de observação WMO (acima de 51) sobre a previsão do modelo, garantindo que o dashboard reflita a chuva real. |
| **Manutenção** | **Custom Hooks / Modularização** | Lógica de `fetch` isolada no `useWeather.ts` e Módulos bem definidos (Auth/Users), seguindo princípios SOLID. |

-----

## 4\. Requisitos Funcionais Checklist

| Funcionalidade | Status | Observação |
| :--- | :--- | :--- |
| **Pipeline Completo** | ✅ Feito | Python → RabbitMQ → Go → NestJS → MongoDB → React. |
| **CRUD Usuários** | ✅ Feito | Listar, Criar (via Registro), **Editar**, **Deletar** e Rotas Protegidas. |
| **Insights de IA** | ✅ Feito | Análise heurística de tendências e alertas de risco (`WeatherService`). |
| **Exportação CSV** | ✅ Feito | Endpoint dedicado para download de dados (`GET /export/csv`). |
| **Gráficos** | ✅ Feito | Visualização de tendência de Temperatura e Chuva via **Recharts**. |
| **Infra (1 Comando)** | ✅ Feito | `docker-compose up -d` inicia todos os 6 serviços. |

-----

## 5\. Guia de Execução (Quick Start)

### Pré-requisitos

  * **Docker** e **Docker Compose** instalados e em execução.

### Passos

1.  **Inicie a Arquitetura:**
    ```bash
    docker-compose up --build -d
    ```
2.  **Verifique o Status:**
    ```bash
    docker-compose ps
    ```
3.  **Acesse a Aplicação:**
    ```
    Frontend URL: http://localhost:5173
    ```

### Credenciais de Acesso

| Detalhe | Valor |
| :--- | :--- |
| **Usuário Admin:** | `gdash@gdash.com` |
| **Senha:** | `gdash2025` |

*(Arquivo `.env.example` deve ser copiado para `.env` com os valores definidos, conforme o `docker-compose.yml`.)*
