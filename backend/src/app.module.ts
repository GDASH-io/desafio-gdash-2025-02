import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { WeatherModule } from './weather/weather.module';
import { StarWarsModule } from './star-wars/star-wars.module';
import { CacheModule } from '@nestjs/cache-manager';
import {
  RegistryLog,
  RegistryLogSchema,
} from './common/schemas/registryLog.schema';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Configuração do Cache em Memória (RAM)
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 1000, // 60 segundos de vida padrão
      max: 100, //  Permite armazenar até 100 páginas/rotas distintas antes de limpar as antigas
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: RegistryLog.name, schema: RegistryLogSchema },
    ]),
    UsersModule,
    AuthModule,
    WeatherModule,
    StarWarsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
