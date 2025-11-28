import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConfigService } from './config.service';
import { UpdateCollectorConfigDto } from './dto/update-collector-config.dto';

@Controller('config')
export class ConfigController {
    constructor(private readonly configService: ConfigService) {}

    @Get('collector')
    getConfig() {
        return this.configService.get();
    }

    @UseGuards(JwtAuthGuard)
    @Patch('collector')
    updateConfig(@Body() body: UpdateCollectorConfigDto) {
        return this.configService.update(body.collectIntervalMinutes);
    }
}