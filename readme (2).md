## Gdash - Dashboard Clima

## Este projeto é um Dashboard de clima com coleta de dados em tempo real. Ele utiliza:

Frontend: React + Tailwind + Shadcd/ui

Backend: Nest(API REST recebe os dados climátcos)

Collector: Python(coleta dados API Open-Meteo e envia para RabbitMQ)

Worker: Go(consome mensagens do RabbitMQ e envia para API NESTJS)

Message Broker: RabbitMQ


## Como gerar uma chave para o GEMINI_API_KEY:

Crie uma conta nesse link https://aistudio.google.com/api-keys e gere uma chave de API.

## Como Rodar no Docker

No diretótio raiz,  rode:

docker-compose up --build


## Link do Vídeo Intoduzindo e rodando o projeto:

https://drive.usercontent.google.com/download?id=1fjwshUNWjNXmLgGBq6XzmKhAFs92zquF&export=download&authuser=0&confirm=t&uuid=5a1ef817-4695-403b-8613-fbbb2ea8fbda&at=ALWLOp7833gYK63evnVT8aY4ypgM:1764596627968

## Serviços e URLs

| Serviço            | URL                                                    |
| ------------------ | ------------------------------------------------------ |
| Frontend React     | [http://localhost:5173](http://localhost:5173)         |
| Backend NestJS API | [http://localhost:3000](http://localhost:3000)         |
| Swagger (NestJS)   | [http://localhost:3000/api](http://localhost:3000/api) |
| RabbitMQ Dashboard | [http://localhost:15672](http://localhost:15672)       |


## Usuário Padrão

email: admin@gdash.com
senha: 123456
