import { Module } from '@nestjs/common'
import { WeatherService } from './weather.service'
import { WeatherController } from './weather.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Weather, WeatherSchema } from './schema/weather.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Weather.name, schema: WeatherSchema }]),
  ],
  providers: [WeatherService],
  controllers: [WeatherController],
  exports: [WeatherService],
})
export class WeatherModule {}
