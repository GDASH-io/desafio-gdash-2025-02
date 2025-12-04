import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherLogsModule } from './weather-logs/weather-logs.module';
import { UsersService } from './users/users.service';
import * as dotenv from 'dotenv';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { WeatherInsightsModule } from './weather-insights/weather-insights.module';
import { PokemonModule } from './pokemon/pokemon.module';
dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/gdash'),
    WeatherLogsModule,
    UsersModule,
    AuthModule,
    WeatherInsightsModule,
    PokemonModule
  ],
})
export class AppModule {
  constructor(private readonly usersService: UsersService) {
    this.bootstrapAdmin();
  }

  async bootstrapAdmin() {
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || '123456';

    const exists = await this.usersService.findByEmail(email);
    if (!exists) {
      await this.usersService.create({
        email,
        password,
        role: 'admin',
      });
      console.log('Admin criado automaticamente!');
    }
  }
}
