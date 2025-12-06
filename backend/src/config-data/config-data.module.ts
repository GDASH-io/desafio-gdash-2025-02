import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigDataController } from './config-data.controller';
import { ConfigDataService } from './config-data.service';
import { ConfigData, ConfigDataSchema } from './schemas/config-data.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ConfigData.name, schema: ConfigDataSchema }]),
    ClientsModule.register([
      {
        name: 'COLLECTOR_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [`amqp://${process.env.RABBITMQ_USER || 'guest'}:${process.env.RABBITMQ_PASSWORD || 'guest'}@${process.env.RABBITMQ_HOST || 'rabbitmq'}:${process.env.RABBITMQ_PORT || 5672}`],
          queue: 'config_updates',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [ConfigDataController],
  providers: [ConfigDataService],
  exports: [ConfigDataService],
})
export class ConfigDataModule {}
