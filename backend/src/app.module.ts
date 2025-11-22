import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SpacexModule } from './spacex/spacex.module';
import { UsersModule } from './users/users.module';
import { WeatherModule } from './weather/weather.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      'mongodb://admin:password123@localhost:27017/gdash?authSource=admin',
    ),
    WeatherModule,
    UsersModule,
    AuthModule,
    SpacexModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
