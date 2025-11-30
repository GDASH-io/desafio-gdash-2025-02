import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { WeatherModule } from './weather/weather.module';
import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './users/users.module';
import { SeedModule } from './seed/seed.module';
import { AuthModule } from './auth/auth.module';
import { SwapiModule } from './swapi/swapi.module';

@Module({
  imports: [PrismaModule, WeatherModule, UsersModule, SeedModule, AuthModule, SwapiModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
