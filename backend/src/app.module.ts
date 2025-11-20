import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WeatherModule } from './weather/weather.module';
import { InsightsModule } from './insights/insights.module';
import { ExternalApiModule } from './external-api/external-api.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/gdash'),
    AuthModule,
    UsersModule,
    WeatherModule,
    InsightsModule,
    ExternalApiModule,
  ],
})
export class AppModule {}

