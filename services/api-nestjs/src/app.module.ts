import { Module } from '@nestjs/common';
import { WeatherModule } from './weather/weather.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { InsightsIaService } from './insights-ia/insights-ia.service';
import { InsightsIaService } from './insights-ia/insights-ia.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGO_URI ?? 'mongodb://localhost/nestjs-weather',
    ),
    WeatherModule,
  ],
  providers: [InsightsIaService],
  controllers: [],
})
export class AppModule { }