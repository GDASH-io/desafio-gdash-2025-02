# Fase 2 - Integração NASA Earth Imagery

**Status:** Concluída  
**Prioridade:** Alta  
**Progresso:** 100%  
**Data de Conclusão:** 23/11/2025

---

## Visão Geral

A Fase 2 implementa a integração com a NASA Worldview API para exibir imagens de satélite da região de Coronel Fabriciano, MG. Esta implementação substitui a integração ANA originalmente planejada e fornece visualizações complementares aos dados climáticos coletados pelo sistema.

## Objetivos

- Integrar com a NASA Worldview API para obtenção de imagens de satélite
- Fornecer visualizações históricas de imagens de satélite (últimos 365 dias)
- Implementar paginação eficiente para navegação temporal
- Criar interface dedicada no frontend para visualização das imagens
- Adicionar métricas e estatísticas sobre disponibilidade de imagens

## Justificativa Técnica

A integração com a NASA Worldview API foi escolhida por:

1. **Disponibilidade Pública:** API pública sem necessidade de autenticação para snapshots
2. **Cobertura Global:** Imagens de satélite disponíveis para qualquer região do planeta
3. **Histórico Extenso:** Acesso a imagens históricas dos últimos 365 dias
4. **Qualidade:** Imagens de alta resolução do MODIS Terra
5. **Complementaridade:** Adiciona contexto visual aos dados climáticos numéricos

## Arquitetura da Solução

### Componentes Backend

#### Módulo NASA (NestJS)

**Localização:** `api-nest/src/modules/nasa/`

**Estrutura:**
- `nasa.module.ts`: Módulo NestJS que configura dependências
- `nasa.service.ts`: Serviço de negócio para integração com NASA Worldview
- `nasa.controller.ts`: Controller REST para exposição de endpoints

**Responsabilidades:**
- Geração de URLs de snapshots da NASA Worldview
- Implementação de paginação temporal (últimos 365 dias)
- Validação de parâmetros de entrada
- Tratamento de erros e exceções

#### Endpoint da API

**Rota:** `GET /api/v1/nasa`

**Query Parameters:**
- `page` (opcional): Número da página, padrão 1, mínimo 1
- `limit` (opcional): Itens por página, padrão 1, máximo 365

**Autenticação:** Requerida (JWT Bearer Token)

**Resposta de Sucesso (200):**
```json
{
  "page": 1,
  "limit": 1,
  "total": 365,
  "nextPage": 2,
  "prevPage": null,
  "items": [
    {
      "date": "2025-11-23",
      "lat": -19.5194,
      "lon": -42.6289,
      "imageUrl": "https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&TIME=2025-11-23&BBOX=-42.7289,-19.6194,-42.5289,-19.4194&LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor&WIDTH=512&HEIGHT=512&FORMAT=image/png"
    }
  ]
}
```

**Resposta de Erro (400):**
```json
{
  "statusCode": 400,
  "message": "Página inválida. Deve ser um número maior que 0."
}
```

### Componentes Frontend

#### Página NASA Imagery

**Localização:** `frontend-react/src/pages/NASA/NasaImagery.tsx`

**Funcionalidades:**
- Visualização de imagens de satélite em cards responsivos
- Paginação com controles de navegação (anterior/próxima)
- Gráfico de disponibilidade de imagens (últimos 30 dias)
- Estatísticas de disponibilidade (total de imagens, taxa de sucesso)
- Tratamento de estados de loading e erro
- Links para visualização em tamanho completo

**Rota:** `/nasa`

**Navegação:** Link adicionado ao menu principal do sistema

## Contrato de Dados

### Interface TypeScript

```typescript
interface NasaImageryItem {
  date: string;           // Data da imagem no formato YYYY-MM-DD
  lat: number;            // Latitude da região (-19.5194)
  lon: number;            // Longitude da região (-42.6289)
  imageUrl: string | null; // URL completa da imagem ou null se indisponível
}

interface NasaImageryResponse {
  page: number;           // Página atual
  limit: number;          // Limite de itens por página
  total: number;          // Total de dias disponíveis (365)
  nextPage: number | null; // Número da próxima página ou null
  prevPage: number | null; // Número da página anterior ou null
  items: NasaImageryItem[]; // Array de itens da página atual
}
```

## Integração com NASA Worldview API

### Especificações Técnicas

**Base URL:** `https://wvs.earthdata.nasa.gov/api/v1/snapshot`

**Método:** GET

**Parâmetros da URL:**
- `REQUEST`: `GetSnapshot` (fixo)
- `TIME`: Data no formato YYYY-MM-DD
- `BBOX`: Bounding box no formato `minLon,minLat,maxLon,maxLat`
- `LAYERS`: `MODIS_Terra_CorrectedReflectance_TrueColor` (fixo)
- `WIDTH`: 512 (fixo)
- `HEIGHT`: 512 (fixo)
- `FORMAT`: `image/png` (fixo)

### Região Monitorada

**Cidade:** Coronel Fabriciano, MG, Brasil

**Coordenadas:**
- Latitude: -19.5194
- Longitude: -42.6289

**Bounding Box:**
- Min Longitude: -42.6289 - 0.1 = -42.7289
- Min Latitude: -19.5194 - 0.1 = -19.6194
- Max Longitude: -42.6289 + 0.1 = -42.5289
- Max Latitude: -19.5194 + 0.1 = -19.4194

### Estratégia de Paginação

A paginação é implementada em memória no backend, seguindo a estratégia:

1. **Cálculo de Datas:** Cada página representa um conjunto de dias históricos
2. **Ordenação:** Datas ordenadas em ordem decrescente (mais recente primeiro)
3. **Offset:** Cálculo baseado em `(page - 1) * limit`
4. **Total:** Fixo em 365 dias (último ano)

**Exemplo:**
- Página 1, limite 1: Data de hoje
- Página 2, limite 1: Data de ontem
- Página 1, limite 7: Últimos 7 dias

## Decisões Arquiteturais

### 1. Geração Dinâmica de URLs

**Decisão:** URLs são geradas dinamicamente no backend, não armazenadas.

**Justificativa:**
- Reduz uso de armazenamento
- URLs sempre atualizadas
- Flexibilidade para mudanças de parâmetros

**Trade-off:** Requer geração a cada requisição, mas o overhead é mínimo.

### 2. Paginação no Backend

**Decisão:** Paginação implementada no serviço NestJS.

**Justificativa:**
- Controle total sobre lógica de paginação
- Validação centralizada de parâmetros
- Facilita testes e manutenção

### 3. Página Dedicada no Frontend

**Decisão:** Criar página separada `/nasa` em vez de integrar no dashboard.

**Justificativa:**
- Melhor organização do código
- Interface focada na visualização de imagens
- Não polui o dashboard principal
- Facilita futuras expansões

### 4. Sem Autenticação na API NASA

**Decisão:** Não implementar autenticação para acesso à NASA Worldview.

**Justificativa:**
- API pública não requer autenticação
- Snapshots são públicos por design
- Reduz complexidade da implementação

## Implementação Técnica

### Backend - NasaService

**Responsabilidades:**
- Geração de URLs de snapshots
- Cálculo de datas históricas
- Implementação de paginação
- Validação de coordenadas

**Método Principal:**
```typescript
async getImagery(page: number, limit: number): Promise<NasaImageryResponse>
```

**Fluxo:**
1. Validação de parâmetros (page >= 1, limit entre 1 e 365)
2. Cálculo de datas baseado em offset
3. Geração de URLs para cada data
4. Construção da resposta paginada

### Backend - NasaController

**Responsabilidades:**
- Recepção de requisições HTTP
- Validação de query parameters
- Tratamento de exceções
- Retorno de respostas formatadas

**Validações:**
- `page` deve ser número inteiro >= 1
- `limit` deve ser número inteiro entre 1 e 365
- Retorna erro 400 para parâmetros inválidos

### Frontend - NasaImagery Component

**Estados Gerenciados:**
- `data`: Dados da resposta da API
- `loading`: Estado de carregamento
- `error`: Mensagens de erro
- `page`: Página atual
- `limit`: Limite de itens
- `imageLoadError`: Array de erros de carregamento de imagens

**Funcionalidades:**
- Fetch automático ao montar componente
- Atualização ao mudar página ou limite
- Tratamento de erros de carregamento de imagens
- Gráfico de disponibilidade (últimos 30 dias)
- Estatísticas calculadas em tempo real

## Testes e Validação

### Testes Realizados

1. **Endpoint Backend:**
   - Validação de parâmetros (page, limit)
   - Cálculo correto de paginação
   - Geração de URLs válidas
   - Tratamento de erros

2. **Integração Frontend:**
   - Carregamento de imagens
   - Navegação de páginas
   - Exibição de gráficos
   - Tratamento de estados de erro

3. **Integração Completa:**
   - Fluxo completo backend → frontend
   - Autenticação JWT funcionando
   - Performance aceitável

### Casos de Teste

**Caso 1: Requisição Válida**
- Input: `page=1, limit=1`
- Esperado: Resposta com 1 item, data de hoje, URL válida

**Caso 2: Paginação**
- Input: `page=2, limit=1`
- Esperado: Resposta com 1 item, data de ontem, nextPage=3, prevPage=1

**Caso 3: Parâmetro Inválido**
- Input: `page=0`
- Esperado: Erro 400 com mensagem descritiva

**Caso 4: Limite Máximo**
- Input: `page=1, limit=365`
- Esperado: Resposta com 365 itens, prevPage=null, nextPage=null

## Limitações Conhecidas

1. **Disponibilidade de Imagens:**
   - Nem todas as datas têm imagens disponíveis
   - Depende de cobertura de nuvens no momento da captura
   - Algumas datas podem retornar imagens em branco

2. **Região Fixa:**
   - Coordenadas são fixas para Coronel Fabriciano
   - Não permite seleção dinâmica de região
   - Bounding box é calculado automaticamente

3. **Performance:**
   - URLs são geradas a cada requisição
   - Sem cache de URLs válidas
   - Pode haver latência na geração de snapshots pela NASA

4. **Resolução:**
   - Imagens fixas em 512x512 pixels
   - Não permite zoom ou ajuste de resolução
   - Formato fixo PNG

## Melhorias Futuras

### Curto Prazo

1. **Cache de URLs:**
   - Implementar cache de URLs válidas
   - Reduzir chamadas desnecessárias
   - Melhorar performance

2. **Validação de Imagens:**
   - Verificar disponibilidade antes de retornar URL
   - Marcar imagens indisponíveis
   - Melhorar experiência do usuário

### Médio Prazo

3. **Múltiplas Camadas:**
   - Permitir seleção de diferentes camadas de satélite
   - Adicionar opções de visualização
   - Expandir funcionalidades

4. **Zoom Configurável:**
   - Permitir ajuste de bounding box
   - Implementar diferentes níveis de zoom
   - Adicionar controles de navegação

### Longo Prazo

5. **Download de Imagens:**
   - Permitir download local das imagens
   - Adicionar opção de exportação
   - Suporte a múltiplos formatos

6. **Comparação Temporal:**
   - Comparar imagens de diferentes datas lado a lado
   - Análise de mudanças ao longo do tempo
   - Visualizações avançadas

## Arquivos do Projeto

### Backend

**Criados:**
- `api-nest/src/modules/nasa/nasa.module.ts`
- `api-nest/src/modules/nasa/nasa.service.ts`
- `api-nest/src/presentation/controllers/nasa.controller.ts`

**Modificados:**
- `api-nest/src/app.module.ts` (adicionado NasaModule aos imports)

### Frontend

**Criados:**
- `frontend-react/src/pages/NASA/NasaImagery.tsx`

**Modificados:**
- `frontend-react/src/app/routes.tsx` (adicionada rota `/nasa`)
- `frontend-react/src/components/Layout.tsx` (adicionado link no menu)

## Referências

- [NASA Worldview Documentation](https://worldview.earthdata.nasa.gov/)
- [NASA Worldview API](https://wvs.earthdata.nasa.gov/api/v1/snapshot)
- [MODIS Terra Documentation](https://modis.gsfc.nasa.gov/about/)

## Conclusão

A Fase 2 foi concluída com sucesso, implementando integração completa com a NASA Worldview API. A solução fornece visualizações de imagens de satélite históricas, complementando os dados climáticos numéricos do sistema. A arquitetura implementada é escalável e permite futuras expansões conforme necessário.

**Status Final:** Concluída e operacional

---

**Última atualização:** 23/11/2025  
**Versão do Documento:** 1.0
