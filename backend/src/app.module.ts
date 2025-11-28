import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WeatherModule } from './weather/weather.module';
import { LocationsModule } from './locations/locations.module';
import { CollectorConfigModule } from './config/config.module';
import { CollectorModule } from './collector/collector.module';
import { ExplorerModule } from './explorer/explorer.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                uri: config.get<string>('MONGO_URI') || 'mongodb://localhost:27017/gdash',
            }),
        }),
        UsersModule,
        AuthModule,
        WeatherModule,
        LocationsModule,
        CollectorConfigModule,
        CollectorModule,
        ExplorerModule,
    ],
    providers: [AppService],
})
export class AppModule {}
