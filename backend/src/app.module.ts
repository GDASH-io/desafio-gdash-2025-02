import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WeatherModule } from './weather/weather.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://admin:password123@localhost:27017/gdash?authSource=admin',
    ),
    WeatherModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
