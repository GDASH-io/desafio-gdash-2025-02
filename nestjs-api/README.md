# 🌦️ NestJS Weather API

API REST desenvolvida em **NestJS + TypeScript + MongoDB** para receber e armazenar dados climáticos processados pelo **Go Weather Worker**.

---

## 📋 **Arquitetura**

```
Python Collector → RabbitMQ → Go Worker → NestJS API → MongoDB
```

### **Fluxo de Dados:**

1. **Python Collector**: Coleta dados da Open-Meteo API a cada 5 minutos
2. **RabbitMQ**: Armazena mensagens na fila `weather_data`
3. **Go Worker**: Consome fila com 5 workers concorrentes, valida e envia para API
4. **NestJS API**: Valida DTOs, salva no MongoDB com Mongoose
5. **MongoDB**: Armazena histórico de dados climáticos

---

## 🏗️ **Estrutura do Projeto**

```
nestjs-api/
├── src/
│   ├── weather/
│   │   ├── schemas/
│   │   │   └── weather.schema.ts      # Schema Mongoose com timestamps
│   │   ├── dto/
│   │   │   └── create-weather.dto.ts  # Validação com class-validator
│   │   ├── weather.controller.ts      # 4 rotas HTTP (POST + 3 GET)
│   │   ├── weather.service.ts         # Lógica de negócio (create, findAll, findRecent, stats)
│   │   └── weather.module.ts          # Módulo NestJS com imports
│   ├── app.module.ts                  # Root module (ConfigModule + MongooseModule)
│   └── main.ts                        # Bootstrap (ValidationPipe + CORS)
├── Dockerfile                         # Multi-stage build (Node 20-alpine)
├── package.json
├── tsconfig.json
└── .env                               # MONGODB_URI, JWT_SECRET, PORT
```

---

## 🚀 **Endpoints**

### **1. POST `/api/weather/logs`** (recebe do Go Worker)

```bash
curl -X POST http://localhost:3000/api/weather/logs \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2025-12-02T21:31:00.581363",
    "collected_at": "2025-12-02T18:30",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "temperature": 25,
    "humidity": 77,
    "wind_speed": 7.9,
    "precipitation": 0.1,
    "weather_code": 80,
    "condition": "pancadas_leves"
  }'
```

**Response 201:**

```json
{
  "_id": "692f5a9490ea01c440642f3a",
  "timestamp": "2025-12-02T21:31:00.581363",
  "collected_at": "2025-12-02T18:30",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "temperature": 25,
  "humidity": 77,
  "wind_speed": 7.9,
  "precipitation": 0.1,
  "weather_code": 80,
  "condition": "pancadas_leves",
  "createdAt": "2025-12-02T21:31:00.624Z",
  "updatedAt": "2025-12-02T21:31:00.624Z",
  "__v": 0
}
```

---

### **2. GET `/api/weather/logs?limit=100`** (lista registros)

```bash
curl http://localhost:3000/api/weather/logs
```

**Response 200:** Array de registros ordenados por `createdAt DESC`

---

### **3. GET `/api/weather/recent?hours=24`** (últimas N horas)

```bash
curl http://localhost:3000/api/weather/recent?hours=24
```

**Response 200:** Registros das últimas 24 horas

---

### **4. GET `/api/weather/stats`** (estatísticas)

```bash
curl http://localhost:3000/api/weather/stats
```

**Response 200:**

```json
{
  "total_records": 1,
  "latest_record": {
    /* último registro */
  },
  "collection_active": true
}
```

---

## 🔧 **Tecnologias**

| Tecnologia          | Versão | Uso                                          |
| ------------------- | ------ | -------------------------------------------- |
| **NestJS**          | 10.3.0 | Framework backend com injeção de dependência |
| **TypeScript**      | 5.3.3  | Linguagem com tipagem estática               |
| **Mongoose**        | 8.0.3  | ODM para MongoDB (schemas, validações)       |
| **class-validator** | 0.14.0 | Validação de DTOs com decorators             |
| **MongoDB**         | 7      | Banco NoSQL para armazenar histórico         |

---

## 🐳 **Docker**

### **Dockerfile Multi-Stage:**

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
```

### **Docker Compose:**

```yaml
nestjs-api:
  build: ./nestjs-api
  ports:
    - "3000:3000"
  depends_on:
    mongodb:
      condition: service_healthy
  environment:
    - MONGODB_URI=mongodb://admin:admin123@mongodb:27017/weather_dashboard
    - JWT_SECRET=super-secret-jwt-key-change-in-production-2024
  healthcheck:
    test:
      [
        "CMD",
        "node",
        "-e",
        "require('http').get('http://localhost:3000/api/weather/stats', ...)",
      ]
    interval: 10s
```

---

## 🧠 **Conceitos NestJS**

### **1. Decorators (Anotações)**

```typescript
@Injectable()  // Marca classe como injetável
@Controller('api/weather')  // Define prefixo de rotas
@Post('logs')  // Define método HTTP + rota
@Body()  // Extrai body da requisição
```

### **2. Dependency Injection (DI)**

```typescript
constructor(
  @InjectModel(Weather.name) private weatherModel: Model<WeatherDocument>
) {}
```

- NestJS **injeta** automaticamente o modelo Mongoose
- Evita `new WeatherService()`, promove testabilidade

### **3. Validation Pipeline**

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Remove propriedades não esperadas
    forbidNonWhitelisted: true, // Rejeita se houver propriedades extras
    transform: true, // Transforma payload em instância do DTO
  })
);
```

### **4. Mongoose Schemas**

```typescript
@Schema({ timestamps: true }) // createdAt/updatedAt automáticos
export class Weather {
  @Prop({ required: true })
  temperature: number;

  @Prop()
  humidity?: number; // Opcional
}
```

### **5. Module System**

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Weather.name, schema: WeatherSchema }]),
  ],
  controllers: [WeatherController],
  providers: [WeatherService],
  exports: [WeatherService], // Permite uso em outros módulos
})
export class WeatherModule {}
```

---

## 📊 **Logs da Aplicação**

```
[Nest] 1  - 12/02/2025, 9:30:55 PM     LOG [NestFactory] Starting Nest application...
[Nest] 1  - 12/02/2025, 9:30:55 PM     LOG [InstanceLoader] AppModule dependencies initialized +17ms
[Nest] 1  - 12/02/2025, 9:30:55 PM     LOG [RoutesResolver] WeatherController {/api/weather}: +19ms
[Nest] 1  - 12/02/2025, 9:30:55 PM     LOG [RouterExplorer] Mapped {/api/weather/logs, POST} route +7ms
[Nest] 1  - 12/02/2025, 9:30:55 PM     LOG [Bootstrap] 🚀 NestJS API rodando em http://localhost:3000
[Nest] 1  - 12/02/2025, 9:31:00 PM     LOG [WeatherController] 🚀 POST /api/weather/logs - Recebendo do Go Worker
[Nest] 1  - 12/02/2025, 9:31:00 PM     LOG [WeatherService] 📥 Recebendo dados climáticos do Go Worker
[Nest] 1  - 12/02/2025, 9:31:00 PM     LOG [WeatherService]    🌡️  25°C
[Nest] 1  - 12/02/2025, 9:31:00 PM     LOG [WeatherService]    💧 77%
[Nest] 1  - 12/02/2025, 9:31:00 PM     LOG [WeatherService]    🌬️  7.9 km/h
[Nest] 1  - 12/02/2025, 9:31:00 PM     LOG [WeatherService] ✅ Dados salvos no MongoDB com sucesso!
```

---

## 🔍 **Validação de Dados**

### **DTO com class-validator:**

```typescript
export class CreateWeatherDto {
  @IsString()
  timestamp: string;

  @IsNumber()
  temperature: number;

  @IsNumber()
  @IsOptional()
  humidity?: number;
}
```

- Se `temperature` não for número → **400 Bad Request**
- Se houver campo extra não esperado → **400 Bad Request**
- Validação automática graças ao `ValidationPipe`

---

## 🎯 **Próximos Passos**

1. ✅ **API funcionando e salvando no MongoDB**
2. ⏳ **Frontend React** (conectar aos endpoints)
3. ⏳ **JWT Authentication** (proteger endpoints)
4. ⏳ **Exportação CSV/XLSX** (relatórios)
5. ⏳ **AI Insights** (análise de tendências)

---

## 🧪 **Como Testar**

### **1. Verificar saúde da API:**

```bash
curl http://localhost:3000/api/weather/stats
```

### **2. Listar registros:**

```bash
curl http://localhost:3000/api/weather/logs
```

### **3. Verificar MongoDB diretamente:**

```bash
docker exec -it gdash-mongodb mongosh -u admin -p admin123 \
  --authenticationDatabase admin weather_dashboard \
  --eval "db.weathers.countDocuments()"
```

---

## 📚 **Recursos de Estudo**

- [NestJS Documentation](https://docs.nestjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [class-validator GitHub](https://github.com/typestack/class-validator)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🤝 **Contribuindo**

Este projeto é um desafio de aprendizado! Sinta-se livre para:

- Adicionar testes unitários (Jest)
- Implementar cache com Redis
- Criar documentação Swagger/OpenAPI
- Adicionar rate limiting

---

**Desenvolvido como parte do desafio GDash** 🚀
