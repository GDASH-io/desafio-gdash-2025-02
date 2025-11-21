# Fase 2 - Paginação ANA (Hidrologia)

**Status:** Opcional - Não Implementada  
**Prioridade:** Baixa  
**Progresso:** 0%

---

## Objetivo

Implementar coletor para dados hidrológicos da Agência Nacional de Águas (ANA), com suporte a paginação e rate limiting. Esta fase é opcional e não está no README.md do desafio, mas foi incluída no plano original do projeto.

## Requisitos

- Pesquisar documentação da API ANA
- Implementar paginação com cursor (Redis ou arquivo)
- Respeitar rate limits e Retry-After
- Normalizar dados em contrato `ana.hydro.readings`
- Publicar no Kafka topic `ana.hydro.readings`
- Testes com mock da API ANA

## Decisão de Implementação

**Status:** Pendente de decisão

Esta fase pode ser implementada em paralelo ou após outras fases, dependendo da necessidade e disponibilidade de tempo.

## Arquitetura Proposta

### Estrutura Sugerida

```
colletor-python/
├── src/
│   ├── infra/
│   │   └── http/
│   │       └── ana_client.py        # Cliente ANA
│   ├── application/
│   │   └── usecases/
│   │       └── fetch_ana_data.py   # Use case ANA
│   └── shared/
│       └── cursor_storage.py        # Armazenamento de cursor
```

### Componentes Principais

#### 1. ANAClient

- Cliente HTTP para API ANA
- Tratamento de rate limits
- Retry com exponential backoff
- Respeito a headers `Retry-After`

#### 2. CursorStorage

- Armazenamento de cursor de paginação
- Opções: Redis ou arquivo local
- Persistência entre execuções

#### 3. FetchANADataUseCase

- Orquestra coleta de dados ANA
- Gerencia paginação
- Normaliza dados para contrato padrão
- Publica no Kafka

## Contrato de Mensagem Proposto

```json
{
  "source": "ana",
  "type": "hydro",
  "station_id": "123456",
  "fetched_at": "2025-11-19T21:05:00-03:00",
  "payload": [
    {
      "timestamp": "2025-11-19T20:00:00-03:00",
      "water_level_m": 2.5,
      "flow_m3_s": 15.3,
      "precipitation_mm": 0.0
    }
  ]
}
```

## Considerações Técnicas

### Rate Limiting

- API ANA possui rate limits específicos
- Necessário implementar throttling
- Respeitar headers `Retry-After`

### Paginação

- API ANA utiliza paginação baseada em cursor
- Cursor deve ser persistido entre execuções
- Recuperação de falhas

### Normalização

- Dados ANA têm formato diferente de dados climáticos
- Necessário mapeamento para contrato padrão
- Validação de dados

## Próximos Passos (Se Implementar)

1. Pesquisar documentação oficial da API ANA
2. Criar estrutura de diretórios
3. Implementar cliente HTTP
4. Implementar cursor storage
5. Implementar use case
6. Testes com mock
7. Integração com Kafka

## Referências

- [Portal Hidrológico ANA](http://www.snirh.gov.br/hidroweb/)
- [API ANA (se disponível)](https://www.ana.gov.br/)

---

**Última atualização:** 21/11/2025

