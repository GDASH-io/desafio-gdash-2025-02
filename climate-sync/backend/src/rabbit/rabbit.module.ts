import { Module } from '@nestjs/common';
import { RabbitService } from './rabbit.service';
import { RabbitConsumer } from './rabbit.consumer';
import { WeatherModule } from '../weather/weather.module';

@Module({
  imports: [WeatherModule],
  providers: [RabbitService, RabbitConsumer],
})
export class RabbitModule {}
