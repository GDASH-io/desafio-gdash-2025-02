# Backend

O Backend é a alma do projeto. Ele recebe os dados do Worker e os salva no banco de dados, comunica-se com a LLM para gerar insights sobre esses dados, faz a autenticação dos usuários, lista pokémons e gera os dados para exibição no Frontend.

# Usuário padrão
- **Email:** `admin@email.com`
- **Password:** `admin`

## Autenticação e Rotas

Todas as rotas da API requerem algum tipo de autenticação, exceto as rotas `/llm` (que servem exclusivamente para testes com a LLM) e `/pokedex` (um mini pokédex separado do projeto).

### Regras de Autenticação:

-   **Autenticação de SESSÃO**: Requerida para as rotas `/auth/...`, `/session_state` , `/weather/now` e `/export/...`.
-   **Autenticação via MASTER_TOKEN**: Requerida para as demais rotas em `/weather/...` (rotas que recebem os dados).

### Detalhes da Autenticação

#### 1. Autenticação de Sessão
Utilizada para interação com usuários finais (Frontend).
-   **Obtenção**: O token de sessão é obtido na rota `/session_state`.
-   **Autenticação**: O token é autenticado utilizando as rotas `/auth`.
-   **Envio**: O cliente deve enviar este token no cabeçalho `Authorization` em todas as requisições subsequentes para rotas protegidas por sessão.

#### 2. Autenticação via Master Token
Utilizada para ingestão de dados por serviços externos.
-   **Configuração**: O master token é configurado via variável de ambiente.
-   **Envio**: O serviço deve incluir o cabeçalho `Authorization` contendo este token mestre

## Documentação das rotas da API `/api/...`

#### GET /session_state
Retorna o estado atual da sessão.
**Request:** (None)
**Response (200):**
```json
{
  "token": "string",
  "user": {
    "display_name": "string"
  }
}
```

#### POST /auth/register
Registra um novo usuário.
**Request:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```
**Response (200):**
```json
{
  "goToPage": "string"
}
```

#### POST /auth/login
Autentica um usuário existente.
**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```
**Response (200):**
```json
{
  "goToPage": "string"
}
```

#### POST /auth/logout
Encerra a sessão do usuário.
**Request:** (None)
**Response (200):**
```json
{
  "goToPage": "string"
}
```

#### POST /auth/email
Verifica se email ja existe um usuario cadastrado com o email informado.
**Request:**
```json
{
  "email": "string"
}
```
**Response (200):**
```json
{
  "goToStep": "login" | "register"
}
```

### Weather

#### GET /weather/now
Retorna os dados meteorológicos atuais e previsões para o frontend.
**Request:** (None)
**Response (200):**
```json
{
  "city": "string",
  "date": "string",
  "hour": "string",
  "temperature": "number",
  "apparentTemperature": "number",
  "maxTemperature": "number",
  "minTemperature": "number",
  "weatherCode": "number",
  "insights": ["string"],
  "hourly": [{
      "time": "number",
      "hour": "string",
      "temperature": "number",
      "weatherCode": "number"
  }],
  "daily": [{
      "time": "number",
      "date": "string",
      "temperature": "number",
      "apparentTemperature": "number",
      "maxTemperature": "number",
      "minTemperature": "number",
      "weatherCode": "number",
      "insights": ["string"]
  }]
}
```

#### POST /weather/current
Salva dados meteorológicos atuais.
**Request:**
```json
{
  "time": "number",
  "interval": "number",
  "temperature2m": "number",
  "relativeHumidity2m": "number",
  "apparentTemperature": "number",
  "isDay": "number",
  "precipitation": "number",
  "rain": "number",
  "showers": "number",
  "snowfall": "number",
  "weatherCode": "number",
  "cloudCover": "number",
  "pressureMsl": "number",
  "surfacePressure": "number",
  "windSpeed10m": "number",
  "windDirection10m": "number",
  "windGusts10m": "number"
}
```
**Response (201):**
```json
{
  "id": "string",
  ... (dados salvos)
}
```

#### POST /weather/hourly
Salva dados meteorológicos horários.
**Request:** Array de objetos ou objeto único com a seguinte estrutura:
```json
{
  "time": "Date (ISO 8601)",
  "temperature2m": "number",
  "relativeHumidity2m": "number",
  "apparentTemperature": "number",
  "precipitationProbability": "number",
  "precipitation": "number",
  "weatherCode": "number",
  "cloudCover": "number",
  "windSpeed10m": "number",
  "windGusts10m": "number",
  "visibility": "number"
}
```
**Response (201):**
```json
{
  "message": "string"
}
```

#### POST /weather/daily
Salva dados meteorológicos diários.
**Request:** Array de objetos ou objeto único com a seguinte estrutura:
```json
{
  "time": "Date (ISO 8601)",
  "weatherCode": "number",
  "temperature2mMax": "number",
  "temperature2mMin": "number",
  "temperature2mMean": "number",
  "apparentTemperatureMax": "number",
  "apparentTemperatureMin": "number",
  "sunrise": "Date (ISO 8601)",
  "sunset": "Date (ISO 8601)",
  "uvIndexMax": "number",
  "precipitationSum": "number",
  "precipitationHours": "number",
  "precipitationProbabilityMax": "number",
  "windGusts10mMax": "number",
  "sunshineDuration": "number",
  "relativeHumidity2mMax": "number",
  "cloudCoverMean": "number",
  "capeMax": "number"
}
```
**Response (201):**
```json
{
  "message": "string"
}
```

### Export

#### GET /export/hourlyCsv
Exporta dados horários em CSV.
**Request:** (None)
**Response (200):** Arquivo CSV (Binary)

#### GET /export/hourlyXlsx
Exporta dados horários em XLSX.
**Request:** (None)
**Response (200):** Arquivo XLSX (Binary)

#### GET /export/dayCsv
Exporta dados diários em CSV.
**Request:** (None)
**Response (200):** Arquivo CSV (Binary)

#### GET /export/dayXlsx
Exporta dados diários em XLSX.
**Request:** (None)
**Response (200):** Arquivo XLSX (Binary)

### Pokedex

#### GET /pokedex
Busca lista de pokémons.
**Request:** Query params: `search` (string), `page` (number)
**Response (200):**
```json
[
  {
    "name": "string",
    "spriteUrl": "string",
    "audioUrl": "string",
    "hp": "number",
    "attack": "number",
    "defense": "number",
    "specialAttack": "number",
    "specialDefense": "number"
  }
]
```

#### GET /pokedex/pokemon
Busca detalhes de um pokémon.
**Request:** Query param: `name` (string)
**Response (200):**
```json
{
  "name": "string",
  "spriteUrl": "string",
  "audioUrl": "string",
  "hp": "number",
  "attack": "number",
  "defense": "number",
  "specialAttack": "number",
  "specialDefense": "number"
}
```

### LLM

#### POST /llm
Interage com a LLM.
**Request:**
```json
{
  "message": "string",
  "system": "string"
}
```
**Response (200):**
```json
{
  "resp": ["string"]
}
```

#### GET /llm/insight/currentDay
Gera insights para o dia atual.
**Request:** (None)
**Response (200):**
```json
{
  "resp": ["string"]
}
```

#### POST /llm/insight/otherDay
Gera insights para um dia específico.
**Request:**
```json
{
  "day": "number",
  "month": "number"
}
```
**Response (200):**
```json
{
  "resp": ["string"]
}
```
