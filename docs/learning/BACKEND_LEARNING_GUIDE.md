# Guia de Aprendizado: Backend (NestJS)

Este guia foi feito para te ensinar como o backend funciona, explicando cada parte do código como se fosse uma aula de programação. Vamos usar o código real do seu projeto como exemplo.

## 1. O Ponto de Partida (`main.ts`)

Todo programa precisa de um começo. No NestJS, esse começo é o arquivo `main.ts`.

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // ... configurações de segurança ...
  await app.listen(3000);
}
bootstrap();
```

**O que está acontecendo aqui?**
*   **`bootstrap`**: É o nome comum para a função que "calça as botas" do aplicativo, ou seja, prepara tudo para começar.
*   **`NestFactory.create(AppModule)`**: Aqui estamos criando uma instância da nossa aplicação. O `AppModule` é o módulo raiz, a caixa principal que contém todas as outras caixas.
*   **`app.listen(3000)`**: O servidor começa a "escutar" na porta 3000. É como abrir uma loja e destrancar a porta para os clientes entrarem.

## 2. A Organização: Módulos (`app.module.ts`)

Imagine que seu código é uma casa. Você não joga tudo na sala. Você tem cozinha, quarto, banheiro. No NestJS, esses cômodos são os **Módulos**.

```typescript
// app.module.ts
@Module({
  imports: [
    UsersModule,
    AuthModule,
    WeatherModule,
    // ...
  ],
})
export class AppModule {}
```

**Conceitos:**
*   **`@Module` (Decorator)**: Tudo que começa com `@` é um Decorator. Ele serve para "etiquetar" uma classe. Aqui, ele diz ao NestJS: "Ei, essa classe `AppModule` é um módulo!".
*   **`imports`**: Aqui listamos outros módulos que este módulo precisa. O `AppModule` (casa) importa `UsersModule` (quarto), `WeatherModule` (varanda), etc.

## 3. Recebendo Pedidos: Controllers (`weather.controller.ts`)

O **Controller** é como o garçom. Ele recebe o pedido do cliente (Frontend), repassa para a cozinha (Service) e devolve o prato pronto.

```typescript
// weather.controller.ts
@Controller('weather') // 1. Rota base
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {} // 2. Injeção de Dependência

  @Get('logs') // 3. Método HTTP e Rota
  async getAllLogs() {
    return this.weatherService.getAllLogs(); // 4. Chamando o Service
  }
}
```

**Explicação:**
1.  **`@Controller('weather')`**: Define que todas as rotas aqui começam com `/weather`.
2.  **`constructor(...)`**: Aqui acontece a mágica da **Injeção de Dependência**. O Controller diz: "Eu preciso do `WeatherService` para funcionar". O NestJS automaticamente cria o Service e entrega para o Controller. Você não precisa fazer `new WeatherService()`.
3.  **`@Get('logs')`**: Diz que quando alguém acessar `GET /weather/logs`, essa função deve rodar.
4.  **`this.weatherService.getAllLogs()`**: O garçom (Controller) não cozinha. Ele pede para o cozinheiro (Service) pegar os logs.

## 4. A Lógica de Negócio: Services (`weather.service.ts`)

O **Service** é o cozinheiro. É onde a mágica acontece, onde as regras de negócio são aplicadas e onde acessamos o banco de dados.

```typescript
// weather.service.ts
@Injectable() // 1. Tornando injetável
export class WeatherService {
  constructor(@Inject(IWeatherRepository) private weatherRepository: IWeatherRepository) {}

  async getInsights(): Promise<any> {
    const logs = await this.weatherRepository.findAll(); // Busca no banco
    
    // Lógica de negócio (A "receita")
    const latest = logs[0];
    let insight = 'Conditions are stable.';
    
    if (latest.temperature > 30) {
      insight = 'It is very hot! Stay hydrated.';
    }
    
    return { insight, ... };
  }
}
```

**Explicação:**
1.  **`@Injectable()`**: Essa etiqueta diz: "Essa classe pode ser injetada em outros lugares (como no Controller)".
2.  **Lógica**: Veja que o Controller não sabe que > 30 graus é quente. Quem sabe disso é o Service. Isso deixa o código organizado. Se amanhã a regra mudar para 35 graus, você só mexe no Service.

## Resumo da Aula

*   **Decorator (`@`)**: Etiquetas que dão poderes às classes (transformam em Módulo, Controller, etc).
*   **Módulo**: Organiza o código em blocos.
*   **Controller**: Recebe as requisições (o Garçom).
*   **Service**: Executa a lógica (o Cozinheiro).
*   **Injeção de Dependência**: O NestJS gerencia a criação e entrega das classes umas para as outras, para você não ter que se preocupar com `new Class()`.

Espero que isso ajude a entender o "cérebro" do seu projeto! 🚀
