# ADR 001: Arquitetura Geral do Sistema

## Status

Aceito

## Contexto

Precisávamos decidir a arquitetura geral do sistema GDASH, considerando:
- Necessidade de coletar dados de múltiplas fontes
- Processamento assíncrono de dados
- Interface web para visualização
- Escalabilidade futura
- Facilidade de manutenção

## Decisão

Adotamos uma arquitetura de microserviços com os seguintes componentes:

1. **Frontend (React)**: Interface web responsiva
2. **Backend (NestJS)**: API REST com autenticação
3. **Collector (Python)**: Coleta dados de APIs externas
4. **Worker (Go)**: Processa mensagens da fila
5. **RabbitMQ**: Fila de mensagens para desacoplamento
6. **MongoDB**: Banco de dados NoSQL

## Consequências

### Positivas
- Separação clara de responsabilidades
- Escalabilidade independente de cada serviço
- Tecnologias adequadas para cada função
- Facilita manutenção e testes

### Negativas
- Maior complexidade operacional
- Necessidade de orquestração (Docker Compose)
- Comunicação entre serviços requer cuidado
- Debugging mais complexo

## Alternativas Consideradas

### Monolito
- **Rejeitado**: Dificulta escalabilidade e manutenção

### Serverless
- **Rejeitado**: Complexidade desnecessária para o escopo atual

### Event-Driven puro
- **Considerado**: Implementado parcialmente via RabbitMQ

## Data

2025-01-24

