# Changelog - Melhorias Implementadas

## [1.1.0] - 2025-01-24

### ✨ Adicionado

#### Swagger/OpenAPI
- Documentação completa da API com Swagger
- Interface interativa disponível em `/api`
- Todos os endpoints documentados com exemplos
- Autenticação JWT integrada na documentação
- Decorators `@ApiTags`, `@ApiOperation`, `@ApiResponse` em todos os controllers
- Documentação de DTOs com `@ApiProperty` e `@ApiPropertyOptional`

#### Paginação
- API de weather logs com paginação completa
- DTOs de paginação (`PaginationQueryDto`, `PaginatedResponseDto`)
- Suporte a filtros por cidade
- Metadados de paginação (total, páginas, navegação anterior/próxima)
- Endpoint `GET /weather/logs` agora retorna dados paginados

#### Testes Automatizados
- Testes unitários para `WeatherController`
- Testes unitários para `WeatherService`
- Configuração Jest completa
- Mocks para Mongoose models
- Cobertura de testes básica

#### CI/CD
- Pipeline GitHub Actions configurado
- Testes automatizados no backend com MongoDB
- Linter e build do frontend
- Build de imagens Docker (apenas em push para main)
- Suporte a code coverage

#### Dashboard Avançado
- Paginação no frontend com controles visuais
- Filtros por cidade com busca em tempo real
- Seleção de itens por página (10, 20, 50, 100)
- Indicadores de página atual e total de páginas
- Navegação anterior/próxima
- Mensagens informativas quando não há dados
- Interface melhorada e mais responsiva

#### Deploy
- Configuração para Railway (`railway.json`)
- Configuração para Render (`render.yaml`)
- Documentação completa de deploy (`DEPLOY.md`)
- Guia passo a passo para ambos os serviços
- Variáveis de ambiente documentadas
- Troubleshooting guide

### 🔄 Modificado

- `GET /weather/logs` agora usa paginação em vez de apenas limit
- Frontend atualizado para usar API paginada
- DTOs atualizados com decorators Swagger
- README atualizado com novas funcionalidades

### 📝 Documentação

- `DEPLOY.md` - Guia completo de deploy
- `CHANGELOG.md` - Este arquivo
- README atualizado com todas as melhorias
- Swagger UI com documentação interativa

### 🛠️ Técnico

- Adicionado `@nestjs/swagger` ao backend
- Criados DTOs de paginação
- Implementado método `findAllPaginated` no service
- Atualizado frontend para usar paginação
- Configurado GitHub Actions workflow
- Criados arquivos de configuração para deploy

## [1.0.0] - Versão Inicial

- Sistema básico de coleta e visualização de dados climáticos
- Backend NestJS
- Frontend React + Vite
- Collector Python
- Worker Go
- Integração com RabbitMQ
- Exportação CSV e XLSX

