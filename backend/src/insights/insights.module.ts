import { Module } from '@nestjs/common';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { WeatherModule } from '../weather/weather.module';

@Module({
    imports: [WeatherModule],
    controllers: [InsightsController],
    providers: [InsightsService],
})
export class InsightsModule { }
