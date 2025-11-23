# Placeholder para o Worker Go

Este diretório conterá o worker em Go que consome o RabbitMQ.

## Estrutura Planejada

```
queue-worker/
├── cmd/
│   └── worker/
│       └── main.go             # Entry point
├── internal/
│   ├── config/                 # Configurações
│   ├── consumer/               # Consumer RabbitMQ
│   ├── validator/              # Validação de dados
│   └── api/                    # Client HTTP para NestJS
├── pkg/
│   └── models/                 # Structs de dados
├── Dockerfile
├── go.mod
└── go.sum
```

## Responsabilidades

- Consumir mensagens da fila `weather_data_queue`
- Validar estrutura do JSON
- Implementar retry com exponential backoff
- Enviar dados para NestJS via HTTP POST
- Gerenciar ack/nack de mensagens
