# Fase 2 - Paginação ANA (Hidrologia) - Plano Detalhado

## Resumo
Implementar coleta paginada de dados hidrológicos da API ANA (Agência Nacional de Águas) e publicar no Kafka topic `ana.hydro.readings`. Esta fase é **opcional** e pode ser desenvolvida em paralelo com outras fases.

## Status
⏳ **OPCIONAL** - Pode ser implementada em paralelo ou após outras fases

## Justificativa
A Fase 2 não está explicitamente no README.md do desafio, mas foi incluída no plano original para:
- Enriquecer dados com informações hidrológicas (vazão, nível de reservatórios)
- Demonstrar capacidade de trabalhar com APIs paginadas
- Adicionar contexto adicional para análise de produção de energia (usinas hidrelétricas)

## Checklist de Tarefas

### 1. Preparação
- [ ] Criar estrutura de diretórios no `colletor-python` (ou novo serviço)
- [ ] Pesquisar e documentar endpoints da API ANA
- [ ] Identificar endpoints relevantes para Coronel Fabriciano/região
- [ ] Configurar variáveis de ambiente

### 2. Implementação
- [ ] Criar `src/infra/http/ana_client.py` (cliente HTTP para API ANA)
- [ ] Implementar pagination handler com cursor
- [ ] Implementar armazenamento de cursor (Redis ou arquivo local)
- [ ] Respeitar rate limits e headers `Retry-After`
- [ ] Implementar retry com exponential backoff
- [ ] Normalizar dados em contrato `ana.hydro.readings`

### 3. Integração
- [ ] Publicar mensagens no Kafka topic `ana.hydro.readings`
- [ ] Integrar com collector existente (ou criar serviço separado)
- [ ] Adicionar ao docker-compose.yml (se serviço separado)

### 4. Testes
- [ ] Testes unitários com mock da API ANA
- [ ] Testes de paginação
- [ ] Testes de rate limit handling

## Contrato de Mensagem (Topic: ana.hydro.readings)

```json
{
  "source": "ana",
  "station_id": "ST12345",
  "station_name": "Usina X - Reservatorio",
  "fetched_at": "2025-11-19T20:00:00-03:00",
  "payload": [
    {
      "timestamp": "2025-11-19T20:00:00-03:00",
      "flow_m3_s": 120.5,
      "water_level_m": 45.3,
      "volume_m3": 1200000
    }
  ]
}
```

## Estratégia de Paginação

### Opção 1: Usar Redis para cursor
- Armazenar última página/offset processada
- Permite retomada após restart
- Requer Redis no docker-compose

### Opção 2: Arquivo local
- Armazenar cursor em arquivo JSON
- Mais simples, sem dependência adicional
- Perde cursor se container for recriado

### Opção 3: Timestamp-based
- Usar `from_date` e `to_date` como cursor
- Mais resiliente a falhas
- Requer lógica de data range

## Rate Limits da API ANA

- Verificar documentação oficial da API ANA
- Implementar leitura de header `Retry-After`
- Implementar backoff quando `X-RateLimit-Remaining` estiver baixo

## Notas Importantes

1. **Opcionalidade**: Esta fase não é obrigatória pelo README.md
2. **Prioridade**: Pode ser desenvolvida em paralelo ou após Fase 3/4
3. **Complexidade**: Depende da documentação e disponibilidade da API ANA
4. **Alternativa**: Se API ANA for complexa, pode usar outra API pública paginada (PokéAPI, SWAPI) conforme README

## Decisão Arquitetural

**Recomendação**: Implementar como parte do `colletor-python` existente, adicionando um novo use case e cliente HTTP, em vez de criar serviço separado. Isso mantém a arquitetura mais simples.

## Próximos Passos

1. Pesquisar documentação da API ANA
2. Identificar endpoints relevantes
3. Decidir se implementa agora ou depois
4. Se implementar, seguir estrutura similar à Fase 1

