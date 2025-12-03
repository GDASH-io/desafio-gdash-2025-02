import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WeatherModule } from './weather/weather.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { InsightsModule } from './insights/insights.module';
import { ExternalModule } from './external/external.module';

import { AppController } from './app.controller';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('MONGO_URI'),
            }),
            inject: [ConfigService],
        }),
        WeatherModule,
        UsersModule,
        AuthModule,
        InsightsModule,
        ExternalModule,
    ],
    controllers: [AppController],
    providers: [],
})
export class AppModule { }
