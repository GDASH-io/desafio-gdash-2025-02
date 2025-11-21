import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // Config global (lê .env)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Conexão com Mongo via MONGODB_URI
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    // Módulo de health-check
    HealthModule,
  ],
})
export class AppModule {}
