import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherModule } from './weather/weather.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AppInitializerService } from './app-initializer.service';
import { SpacexModule } from './external/spacex/spacex.module';

@Module({
  imports: [
    //Carrega o .env primeiro
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Conexão com o MongoDB usando as variáveis de ambiente injetadas pelo Docker
    MongooseModule.forRoot(
      `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:27017/${process.env.MONGO_DB}?authSource=admin`,
    ),
    WeatherModule,
    UsersModule,
    AuthModule,
    SpacexModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppInitializerService],
})
export class AppModule {}
