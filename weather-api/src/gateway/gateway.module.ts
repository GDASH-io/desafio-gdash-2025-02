import { Module } from '@nestjs/common';

import { WeatherModule } from '../weather/weather.module';
import { RabbitMQGateway } from './queue.gateway';

@Module({
  imports: [WeatherModule],
  providers: [RabbitMQGateway],
  exports: [RabbitMQGateway],
})
export class GatewayModule {}
