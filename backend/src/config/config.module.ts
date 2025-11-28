import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';
import { CollectorConfig, CollectorConfigSchema } from './schemas/config.schema';
import { Location, LocationSchema } from '../locations/schemas/location.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: CollectorConfig.name, schema: CollectorConfigSchema },
            { name: Location.name, schema: LocationSchema },
        ]),
    ],
    controllers: [ConfigController],
    providers: [ConfigService],
    exports: [ConfigService],
})
export class CollectorConfigModule {}