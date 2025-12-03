import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { WeatherService } from 'weather/weather.service';

@Injectable()
export class RabbitMQGateway implements OnModuleInit {
  private channel: amqp.Channel;

  constructor(private readonly weatherService: WeatherService) {}

  private async connectToRabbit() {
    while (true) {
      try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        this.channel = await connection.createChannel();
        await this.channel.assertQueue('weather', { durable: false });

        break;
      } catch {
        await new Promise((res) => setTimeout(res, 3000));
      }
    }
  }

  async onModuleInit() {
    await this.connectToRabbit();

    // Consome a fila assim que o módulo é iniciado
    this.channel.consume(
      'weather',
      async (msg) => {
        if (!msg) return;
        const data = JSON.parse(msg.content.toString());
        try {
          const rawCurrent = data.raw?.current_weather;
          await this.weatherService.create({
            source: 'api',
            timestamp:
              rawCurrent?.time ?? data.timestamp ?? new Date().toISOString(),
            lat: data.lat,
            lon: data.lon,
            temperatureC: data.temperatureC,
            humidity: data.humidity ?? null,
            pressureHpa: data.pressureHpa ?? undefined,
            windSpeedMs: data.windSpeedMs,
            windDirection: data.windDirection,
            precipitation: data.precipitation ?? undefined,
            raw: data.raw,
          });

          console.log('✔ Dado salvo no Mongo via RabbitMQ:', data);
          this.channel.ack(msg);
        } catch (err) {
          console.error('Erro ao processar mensagem:', err);
        }
      },
      { noAck: false },
    );
  }
}
