# Documentação do Projeto GDASH Challenge

Este diretório contém toda a documentação do projeto, organizada por categoria.

## Índice de Documentos

### Visão Geral e Arquitetura

- **[system-architecture.md](./system-architecture.md)** - Arquitetura completa do sistema
- **[uml-diagram.md](./uml-diagram.md)** - Diagramas UML da aplicação
- **[STATUS.md](./STATUS.md)** - Status atual do projeto, progresso por fase e métricas
- **[RESUMO_IMPLEMENTACOES.md](./RESUMO_IMPLEMENTACOES.md)** - Resumo das implementações recentes e próximos passos

### Documentação por Fase

- **[FASE1.md](./FASE1.md)** - Fase 1: Collector (Python) - Open-Meteo
- **[FASE2.md](./FASE2.md)** - Fase 2: Paginação ANA (Opcional)
- **[FASE3.md](./FASE3.md)** - Fase 3: Worker (Go)
- **[FASE4.md](./FASE4.md)** - Fase 4: API NestJS (Persistência e Endpoints)
- **[FASE5.md](./FASE5.md)** - Fase 5: Frontend React (Dashboard)
- **[FASE6.md](./FASE6.md)** - Fase 6: IA/Insights (NestJS)

### Planejamento e Progresso

- **[TODO.md](./TODO.md)** - Checklist detalhado de tarefas por fase
- **[NEXT_STEPS.md](./NEXT_STEPS.md)** - Próximos passos e prioridades de desenvolvimento

### Documentação Técnica

- **[Endpoints.md](./Endpoints.md)** - Documentação completa de todos os endpoints da API
- **[COMMIT_GUIDE.md](./COMMIT_GUIDE.md)** - Guia de convenções de commits (Conventional Commits)
- **[IA_INSIGHTS_STRATEGY.md](./IA_INSIGHTS_STRATEGY.md)** - Estratégia e arquitetura de IA/Insights (Fase 6)

### Testes e Implementação

- **[TESTE_SISTEMA.md](./TESTE_SISTEMA.md)** - Guia completo de teste do sistema
- **[TESTE_SISTEMA_COMPLETO.md](./TESTE_SISTEMA_COMPLETO.md)** - Testes completos após melhorias do dashboard
- **[IMPLEMENTACAO_COMPLETA.md](./IMPLEMENTACAO_COMPLETA.md)** - Resumo da implementação da Fase 6
- **[IMPLEMENTACAO_FLUXO_123.md](./IMPLEMENTACAO_FLUXO_123.md)** - Implementação das melhorias do dashboard (Fluxo 1, 2, 3)
- **[DASHBOARD_ENHANCEMENTS.md](./DASHBOARD_ENHANCEMENTS.md)** - Análise e recomendações de melhorias no dashboard
- **[test-system.sh](./test-system.sh)** - Script automatizado de testes

### Planos de Fase

- **[FASE2_PLAN.md](./FASE2_PLAN.md)** - Plano detalhado da Fase 2 (Paginação ANA - Opcional)

### Documentos Históricos

- **[initial_project_files_gdash_challenge.md](./initial_project_files_gdash_challenge.md)** - Arquivos iniciais do desafio (referência histórica)
- **[CHANGELOG_DOCS.md](./CHANGELOG_DOCS.md)** - Changelog das atualizações de documentação

---

## Início Rápido

1. **Para entender a arquitetura:** Leia [system-architecture.md](./system-architecture.md)
2. **Para ver diagramas UML:** Leia [uml-diagram.md](./uml-diagram.md)
3. **Para entender o status atual:** Leia [STATUS.md](./STATUS.md)
4. **Para ver detalhes de cada fase:** Leia [FASE1.md](./FASE1.md) até [FASE6.md](./FASE6.md)
5. **Para consultar endpoints:** Leia [Endpoints.md](./Endpoints.md)
6. **Para testar o sistema:** Leia [TESTE_SISTEMA.md](./TESTE_SISTEMA.md)

---

## Status Atual do Projeto

**Progresso Total: ~95%**

- Fase 1 - Collector (Python): 100%
- Fase 3 - Worker (Go): 100%
- Fase 4 - API NestJS: 100%
- Fase 5 - Frontend React: 100%
- Fase 6 - IA/Insights: 100%
- Fase 2 - Paginação ANA: 0% (Opcional)

---

## Notas

- Todos os documentos são atualizados conforme o desenvolvimento avança
- O README.md principal do projeto está na raiz: [../README.md](../README.md)
- Documentação específica de cada serviço está em seus respectivos diretórios:
  - `colletor-python/README.md`
  - `worker-go/README.md`
  - `api-nest/README.md`
  - `frontend-react/README.md`

---

## Arquitetura do Projeto

O projeto segue **Clean Architecture** em todos os serviços:

```
Open-Meteo API → Collector (Python) → Kafka → Worker (Go) → API NestJS → MongoDB
                                                                    ↓
                                                              Frontend React
```

### Serviços

- **Collector (Python)**: Coleta dados climáticos da Open-Meteo API
- **Worker (Go)**: Processa mensagens do Kafka e calcula métricas PV
- **API NestJS**: Persiste dados e expõe endpoints REST com insights de IA
- **Frontend React**: Interface web com dashboard e visualizações

---

**Última atualização:** 21/11/2025 - Previsão 7 dias e melhorias no Dashboard
