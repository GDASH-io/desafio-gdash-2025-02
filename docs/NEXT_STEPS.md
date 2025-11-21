# Próximos Passos - GDASH Challenge 2025/02

**Última atualização:** 21/11/2025

## 🎯 Prioridades

### 1. Fase 6 - IA/Insights (Alta Prioridade)

Esta é a próxima fase crítica do projeto. Implementar módulo de insights com análise de dados climáticos e geração de recomendações.

#### Tarefas Principais:

1. **Estrutura do Módulo**
   - [ ] Criar módulo `InsightsModule` no NestJS
   - [ ] Implementar Clean Architecture (Domain, Application, Infrastructure)
   - [ ] Criar entidade `Insight` no MongoDB

2. **Regras Heurísticas para PV**
   - [ ] High soiling risk (baseado em precipitação acumulada)
   - [ ] Consecutive cloudy days (dias consecutivos com alta cobertura de nuvens)
   - [ ] Heat derating (temperatura acima de threshold)
   - [ ] Wind derating (vento extremo)
   - [ ] Estimated production impact (%)

3. **Análise Estatística**
   - [ ] Média de temperatura/umidade em períodos
   - [ ] Detecção de tendência (subindo/caindo)
   - [ ] Classificação do dia (frio/quente/agradável/chuvoso)

4. **Geração de Texto**
   - [ ] Resumo do período
   - [ ] Alertas contextuais
   - [ ] Recomendações de manutenção

5. **Pontuações**
   - [ ] Comfort score (0-100)
   - [ ] PV production score (0-100)

6. **Endpoints**
   - [ ] GET `/api/v1/weather/insights?from=&to=`
   - [ ] POST `/api/v1/weather/insights` (forçar recálculo)

7. **Cache**
   - [ ] Implementar cache de insights (MongoDB ou Redis)

8. **Frontend**
   - [ ] Seção de Insights no Dashboard
   - [ ] Visualização de gráficos de insights
   - [ ] Alertas e recomendações

9. **Testes**
   - [ ] Testes unitários para cada regra
   - [ ] Testes de integração com dados históricos

**Estimativa:** 2-3 semanas

---

### 2. Testes da API NestJS (Média Prioridade)

Completar cobertura de testes da API.

#### Tarefas:

- [ ] Testes unitários para use cases
- [ ] Testes unitários para controllers
- [ ] Testes de integração para endpoints
- [ ] Testes de autenticação e autorização
- [ ] Testes de validação de DTOs

**Estimativa:** 1 semana

---

### 3. Fase 2 - Paginação ANA (Baixa Prioridade - Opcional)

Implementar coletor para dados hidrológicos da ANA.

#### Tarefas:

- [ ] Pesquisar documentação da API ANA
- [ ] Decidir se implementa (avaliar necessidade)
- [ ] Implementar paginação com cursor
- [ ] Respeitar rate limits
- [ ] Normalizar dados
- [ ] Publicar no Kafka

**Estimativa:** 1-2 semanas (se decidir implementar)

---

## 📋 Checklist de Preparação para Fase 6

### Antes de Começar:

- [ ] Revisar documentação de estratégia de IA: [IA_INSIGHTS_STRATEGY.md](./IA_INSIGHTS_STRATEGY.md)
- [ ] Analisar dados históricos disponíveis no MongoDB
- [ ] Definir thresholds para regras heurísticas
- [ ] Criar branch: `feature/insights-ai`
- [ ] Configurar ambiente de desenvolvimento

### Durante o Desenvolvimento:

- [ ] Seguir Clean Architecture
- [ ] Implementar testes junto com código
- [ ] Documentar cada regra e algoritmo
- [ ] Validar resultados com dados reais
- [ ] Fazer commits seguindo Conventional Commits

### Antes de Finalizar:

- [ ] Revisar código
- [ ] Executar todos os testes
- [ ] Testar integração completa
- [ ] Atualizar documentação
- [ ] Atualizar [Endpoints.md](./Endpoints.md)
- [ ] Atualizar [TODO.md](./TODO.md)

---

## 🚀 Como Começar a Fase 6

1. **Criar branch:**
   ```bash
   git checkout -b feature/insights-ai
   ```

2. **Estrutura inicial:**
   ```
   api-nest/src/
   ├── domain/
   │   ├── entities/
   │   │   └── insight.entity.ts
   │   └── repositories/
   │       └── insight.repository.ts
   ├── application/
   │   └── usecases/
   │       └── insights/
   │           ├── generate-insights.use-case.ts
   │           ├── get-insights.use-case.ts
   │           └── calculate-pv-metrics.use-case.ts
   ├── infra/
   │   └── services/
   │       ├── pv-rules.service.ts
   │       ├── statistics.service.ts
   │       └── text-generator.service.ts
   └── presentation/
       └── controllers/
           └── insights.controller.ts
   ```

3. **Começar pela regra mais simples:**
   - Implementar cálculo de média de temperatura
   - Criar teste unitário
   - Integrar no use case
   - Testar com dados reais

4. **Iterar:**
   - Adicionar uma regra por vez
   - Testar cada regra isoladamente
   - Integrar no endpoint
   - Validar resultados

---

## 📊 Métricas de Sucesso

A Fase 6 será considerada concluída quando:

- ✅ Todos os endpoints de insights estiverem funcionando
- ✅ Regras heurísticas calculando corretamente
- ✅ Análise estatística gerando dados precisos
- ✅ Textos gerados sendo relevantes e úteis
- ✅ Pontuações refletindo condições reais
- ✅ Cache funcionando corretamente
- ✅ Frontend exibindo insights
- ✅ Testes com cobertura adequada (>80%)
- ✅ Documentação completa

---

## 🔗 Referências

- [Estratégia de IA/Insights](./IA_INSIGHTS_STRATEGY.md)
- [Documentação de Endpoints](./Endpoints.md)
- [TODO Detalhado](./TODO.md)
- [Status do Projeto](./STATUS.md)

