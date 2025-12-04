# ClimaTempo

Sistema integrado para coleta, processamento e visualização de dados climáticos.

## Setup

```bash
cp .env.example .env
make up
```

## Serviços

- Frontend: http://localhost
- API: http://localhost:3000/api
- MongoDB: localhost:27017
- Redis: localhost:6379

## Variáveis de Ambiente

Veja `.env.example` para referência:

```env
GEMINI_API_KEY=sua-chave-aqui
LATITUDE=-22.9099
LONGITUDE=-47.0626
```

## Comandos

```bash
make up              # Iniciar
make down            # Parar
make logs            # Ver logs

docker-compose logs -f nestjs-api     # logs da API
docker-compose logs -f data-collector # logs do coletor
docker-compose logs -f go-worker      # logs do worker
```

## Fluxo

1. `data-collector` coleta dados de Open-Meteo e publica em Redis
2. `go-worker` consome de Redis e envia para a API
3. `nestjs-api` salva no MongoDB e gera insights (se GEMINI_API_KEY presente)
4. Frontend consome a API para exibir dados

## Credenciais

- Usuário: `admin`
- Senha: `password123`
