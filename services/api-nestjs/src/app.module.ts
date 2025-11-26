import { Module } from '@nestjs/common';
import { WeatherModule } from './weather/weather.module';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGO_URI ?? 'mongodb://localhost/nestjs-weather',
    ),
    WeatherModule,
    AuthModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule { }