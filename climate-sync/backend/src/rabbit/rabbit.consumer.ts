import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { RabbitService } from './rabbit.service'
import { WeatherService } from '../weather/weather.service'

@Injectable()
export class RabbitConsumer implements OnModuleInit {
  private readonly logger = new Logger(RabbitConsumer.name)

  constructor(
    private rabbit: RabbitService,
    private weatherService: WeatherService
  ) {
    this.logger.log('🔧 RabbitConsumer constructor called')
  }

  async onModuleInit() {
    this.logger.log('🔄 RabbitConsumer onModuleInit starting...')

    try {
      this.logger.log('⏳ Waiting for RabbitService to be ready...')
      const channel = await this.rabbit.getChannel()
      this.logger.log('✅ Channel obtained from RabbitService')

      const queue = 'weather.data'
      this.logger.log(`🎯 Starting to consume queue: ${queue}`)

      await channel.consume(
        queue,
        async (msg: any) => {
          if (!msg) {
            this.logger.log('📭 Received null message')
            return
          }

          try {
            const content = msg.content.toString()
            this.logger.log(`📥 Received message: ${content}`)

            // Parse da mensagem JSON
            const weatherData = JSON.parse(content)

            // Salvar no MongoDB usando o WeatherService
            await this.weatherService.saveWeather(weatherData)

            this.logger.log(
              `✅ Weather data saved to MongoDB: ${weatherData.data.temperature}°C`
            )

            channel.ack(msg)
          } catch (err) {
            this.logger.error('❌ Failed to process message:', err)
            channel.nack(msg, false, true)
          }
        },
        { noAck: false }
      )

      this.logger.log('✅ RabbitConsumer started successfully')
    } catch (error) {
      this.logger.error('❌ RabbitConsumer failed to start:', error)
    }
  }
}
