import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { WeatherModule } from './modules/weather/weather.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { InsightsModule } from './modules/insights/insights.module';
import { NasaModule } from './modules/nasa/nasa.module';
import { JwtAuthGuard } from './infra/auth/jwt-auth.guard';
import { AppController } from './presentation/controllers/app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URL || 'mongodb://root:root@mongodb:27017/gdash?authSource=admin'),
    WeatherModule,
    AuthModule,
    UsersModule,
    InsightsModule,
    NasaModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}

