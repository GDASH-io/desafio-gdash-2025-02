import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WeatherModule } from './weather/weather.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/gdash'),
    AuthModule, UsersModule, WeatherModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
