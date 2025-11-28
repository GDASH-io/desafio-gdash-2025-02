import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { WeatherLog, WeatherLogSchema } from './schemas/weather-log.schema';
import { AiInsight, AiInsightSchema } from './schemas/ai-insight.schema';

@Module({
    imports: [
        ConfigModule,
        MongooseModule.forFeature([
            { name: WeatherLog.name, schema: WeatherLogSchema },
            { name: AiInsight.name, schema: AiInsightSchema },
        ]),
    ],
    providers: [WeatherService],
    controllers: [WeatherController],
    exports: [WeatherService, MongooseModule],
})
export class WeatherModule {}
