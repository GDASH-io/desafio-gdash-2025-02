import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as amqplib from 'amqplib'

@Injectable()
export class RabbitService implements OnModuleInit {
  private readonly logger = new Logger(RabbitService.name)
  private channel: amqplib.Channel
  private initPromise: Promise<void>

  constructor(private configService: ConfigService) {
    this.logger.log('🔧 RabbitService constructor called')
    // Inicia a configuração imediatamente no constructor
    this.initPromise = this.initialize()
  }

  private async initialize(): Promise<void> {
    this.logger.log('🔄 RabbitService initialize started')

    try {
      const url = this.configService.get<string>('RABBITMQ_URL')
      this.logger.log(`🔗 RABBITMQ_URL: ${url}`)

      if (!url) {
        throw new Error('RABBITMQ_URL is not defined')
      }

      this.logger.log('📡 Connecting to RabbitMQ...')
      const connection = await amqplib.connect(url)
      this.logger.log('✅ Connected to RabbitMQ')

      this.channel = await connection.createChannel()
      this.logger.log('✅ Channel created')

      this.logger.log('🔄 Creating exchange...')
      await this.channel.assertExchange('weather.exchange', 'topic', {
        durable: true,
      })
      this.logger.log('✅ Exchange weather.exchange created')

      this.logger.log('🔄 Creating queue...')
      await this.channel.assertQueue('weather.data', {
        durable: true,
      })
      this.logger.log('✅ Queue weather.data created')

      this.logger.log('🔄 Creating binding...')
      await this.channel.bindQueue(
        'weather.data',
        'weather.exchange',
        'weather.data'
      )
      this.logger.log('✅ Binding created')

      this.logger.log('🐰 RabbitMQ fully configured!')
    } catch (error) {
      this.logger.error('❌ RabbitService initialization failed:', error)
      throw error
    }
  }

  async onModuleInit() {
    // Aguarda a inicialização completar
    await this.initPromise
    this.logger.log('✅ RabbitService onModuleInit completed')
  }

  async getChannel(): Promise<amqplib.Channel> {
    // Sempre aguarda a inicialização
    await this.initPromise
    return this.channel
  }
}
