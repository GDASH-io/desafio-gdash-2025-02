import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { WeatherService } from './weather.service'
import { WeatherController } from './weather.controller'
import { Weather, WeatherSchema } from './schema/weather.schema'
import { AiService } from './ai.service'
import { AuthModule } from '../auth/auth.module' // ← Adicione esta importação

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Weather.name, schema: WeatherSchema }]),
    AuthModule, // ← Adicione esta linha
  ],
  providers: [WeatherService, AiService],
  controllers: [WeatherController],
  exports: [WeatherService],
})
export class WeatherModule {}