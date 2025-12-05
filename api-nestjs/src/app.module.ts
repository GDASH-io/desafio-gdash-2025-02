import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config'; 
import { WeatherModule } from './weather/weather.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@mongodb:27017/gdash?authSource=admin`,
      }),
    }),

    WeatherModule,
    AuthModule,
    UsersModule,
    AiModule,
  ],
})
export class AppModule {}