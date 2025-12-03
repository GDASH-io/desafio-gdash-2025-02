import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { WeatherLog, WeatherLogSchema } from './weather.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: WeatherLog.name, schema: WeatherLogSchema }]),
    ],
    controllers: [WeatherController],
    providers: [WeatherService],
    exports: [WeatherService],
})
export class WeatherModule { }
