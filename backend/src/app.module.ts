import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WeatherModule } from './modules/weather/weather.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PokemonModule } from './modules/pokemon/pokemon.module';
import { SeedModule } from './modules/seed/seed.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://admin:admin123@mongodb:27017/gdash?authSource=admin',
      }),
      inject: [ConfigService],
    }),
    WeatherModule,
    UsersModule,
    AuthModule,
    PokemonModule,
    SeedModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

