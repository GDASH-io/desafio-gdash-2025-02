import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { WeatherModule } from './weather/weather.module';
import { PokeapiModule } from './pokeape/pokeapi.module';
import { AuthModule } from './auth/auth.module';
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  health() {
    return { status: 'ok', message: 'API is running' };
  }
}

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/climatempodb';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(MONGO_URI),
    UsersModule,
    AuthModule,
    WeatherModule,
    PokeapiModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}