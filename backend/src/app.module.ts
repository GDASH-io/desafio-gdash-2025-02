import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherModule } from './modules/weather/weather.module';
import { AiInsightModule } from './modules/ai-insight/ai-insight.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Conecta ao container do Mongo definido no docker-compose
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://gdash_mongo:27017/gdash'),
    WeatherModule,
    AiInsightModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}