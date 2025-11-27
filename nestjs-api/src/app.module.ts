import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { PokemonModule } from './pokemon/pokemon.module';
import { WeatherModule } from './weather/weather.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    // Conecta no Mongo (usando variável de ambiente ou padrão docker)
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://mongodb:27017/weatherdb',
    ),
    AuthModule,
    WeatherModule,
    PokemonModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
