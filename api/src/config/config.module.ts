import { Module } from '@nestjs/common';
import { ConfigController } from './config.controller';
import { WeatherConfigService } from './config.service';

@Module({
  controllers: [ConfigController],
  providers: [WeatherConfigService],
  exports: [WeatherConfigService],
})
export class WeatherConfigModule {}