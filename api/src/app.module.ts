import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherModule } from './weather/weather.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { InsightsModule } from './insights/insights.module';
import { PokemonModule } from './pokemon/pokemon.module';
import { SeedService } from './seed/seed.service';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
    MongooseModule.forRoot(databaseConfig.uri),
    WeatherModule,
    UsersModule,
    AuthModule,
    InsightsModule,
    PokemonModule,
  ],
})
export class AppModule {}
