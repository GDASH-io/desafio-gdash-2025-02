import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { WeatherModule } from './weather/weather.module';

@Module({
  imports: [PrismaModule, WeatherModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
