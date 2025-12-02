 
Link do vídeo no Youtube: https://youtu.be/yUfyziTqqLI

## Para iniciar o projeto, utilize o seguinte comando:
  docker-compose build 
  docker-compose up -d

## Acesso ao sistema:
  email: admin@example.com
  senha: 123456

Arquivo .env contém todas as variáveis necessárias para configuração dos serviços.

## Rotas da API NestJS:
  module auth:
  - POST auth/login 
  - POST auth/Logout
  - GET auth/me

  module users:
  - POST users/
  - GET users/
  - GET users/:id
  - PATCH users/:id
  - DELETE users/:id

  module weather:
  - GET weather/logs
  - GET weather/insights?windowHours=24
  - GET weather/expport.csv
  - GET weather/expport.xlsx

## Rotas do Frontend React:
  - /
    rota (/) com dashboard
  - /login
  - /users

Python coletor de dados da API Open-Meteo envia para RabbitMQ.
Worker em Go consome dados do RabbitMQ e envia para API NestJS.
API NestJS armazena dados no MongoDB e expõe endpoints para o frontend.
Frontend em React exibe dashboard com dados climáticos e insights de IA.

## ✅ Checklist rápido

- [X] Python coleta dados de clima (Open-Meteo ou OpenWeather)  
- [X] Python envia dados para RabbitMQ  
- [X] Worker Go consome a fila e envia para a API NestJS  
- [X] API NestJS:
  - [X] Armazena logs de clima em MongoDB  
  - [X] Exponde endpoints para listar dados  
  - [X] Gera/retorna insights de IA (endpoint próprio)  
  - [X] Exporta dados em CSV/XLSX  
  - [X] Implementa CRUD de usuários + autenticação  
  - [ ] (Opcional) Integração com API pública paginada  
- [X] Frontend React + Vite + Tailwind + shadcn/ui:
  - [X] Dashboard de clima com dados reais  
  - [X] Exibição de insights de IA  
  - [X] CRUD de usuários + login  
  - [ ] (Opcional) Página consumindo API pública paginada  
- [X] Docker Compose sobe todos os serviços  
- [X] Código em TypeScript (backend e frontend)  
- [X] Vídeo explicativo (máx. 5 minutos)  
- [X] Pull Request via branch com seu nome completo  
- [X] README completo com instruções de execução  
- [X] Logs e tratamento de erros básicos em cada serviço  
