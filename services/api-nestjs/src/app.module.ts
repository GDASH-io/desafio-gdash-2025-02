import { Module } from '@nestjs/common';
import { WeatherModule } from './weather/weather.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    MongooseModule.forRoot(
      process.env.MONGO_URI ?? 'mongodb://localhost/nestjs-weather',
    ),
    WeatherModule,
  ],
})
export class AppModule {}

/* uso:
constructor(private readonly configService: ConfigService) {}

const port = this.configService.get<number>('PORT');
*/
