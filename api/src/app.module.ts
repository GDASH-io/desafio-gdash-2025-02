import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users.module';
import { AuthModule } from './modules/auth.module';
import { ExplorerModule } from './modules/explorer.module';
import { WeatherModule } from './modules/weather.module' 

@Module({
  imports: [
    ConfigModule.forRoot({
 isGlobal: true,
}),
  MongooseModule.forRoot(process.env.MONGO_URL ?? ''),
  UsersModule,
  AuthModule,
  ExplorerModule,
  WeatherModule
  ]
})
export class AppModule {}
