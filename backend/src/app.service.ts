import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users/users.service';
import { ConfigService as CollectorConfigService } from './config/config.service';

@Injectable()
export class AppService implements OnModuleInit {
    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
        private readonly collectorConfig: CollectorConfigService,
    ) {}

    async onModuleInit() {
        await this.usersService.ensureDefaultUser();
        await this.collectorConfig.ensureDefault();
    }
}