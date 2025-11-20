import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { WeatherModule } from './weather/weather.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [PrismaModule, WeatherModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
