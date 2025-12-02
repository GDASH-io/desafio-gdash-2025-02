import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { WeatherModule } from '../weather/weather.module';

@Module({
  imports: [WeatherModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
