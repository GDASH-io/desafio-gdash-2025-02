import { Module } from '@nestjs/common';
import { LocationsModule } from '../locations/locations.module';
import { CollectorConfigModule } from '../config/config.module';
import { WeatherModule } from '../weather/weather.module';
import { CollectorService } from './collector.service';

@Module({
    imports: [LocationsModule, CollectorConfigModule, WeatherModule],
    providers: [CollectorService],
})
export class CollectorModule {}