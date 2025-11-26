# Referência da API

Base URL: `http://localhost:3000/api/v1`

## Autenticação

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| POST | `/auth/login` | Autentica usuário e retorna token JWT |
| POST | `/auth/register` | Registra um novo usuário |

## Dados Climáticos (Weather)

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| GET | `/weather/logs` | Lista logs de clima (com paginação) |
| GET | `/weather/logs/latest` | Retorna o registro climático mais recente |
| GET | `/weather/precipitation/24h` | Acumulado de chuva nas últimas 24h |
| GET | `/weather/insights` | Retorna insights gerados por IA |
| POST | `/weather/logs` | Cria novo log (Uso interno do Worker) |

## Usuários

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| GET | `/users` | Lista todos os usuários |
| GET | `/users/:id` | Detalhes de um usuário específico |
| PUT | `/users/:id` | Atualiza dados do usuário |
| DELETE | `/users/:id` | Remove um usuário |

## Exportação

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| GET | `/weather/export.csv` | Download dos dados em CSV |
| GET | `/weather/export.xlsx` | Download dos dados em Excel (XLSX) |

## Health Check

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| GET | `/weather/health` | Verifica status da API |
