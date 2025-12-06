import { Controller, Get, Put, Body } from '@nestjs/common';
import { ConfigDataService } from './config-data.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { IsString, IsNotEmpty } from 'class-validator';

class UpdateConfigDto {
  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  latitude: string;

  @IsString()
  @IsNotEmpty()
  longitude: string;
}

@ApiTags('Configuration')
@Controller('config')
export class ConfigDataController {
  constructor(private readonly configDataService: ConfigDataService) {}

  @Get()
  @ApiOperation({ summary: 'Get current weather monitoring configuration' })
  @ApiResponse({ status: 200, description: 'Configuration retrieved successfully' })
  async getConfig() {
    return this.configDataService.getConfig();
  }

  @Put()
  @ApiOperation({ summary: 'Update weather monitoring configuration' })
  @ApiResponse({ status: 200, description: 'Configuration updated successfully' })
  async updateConfig(@Body() body: UpdateConfigDto) {
    return this.configDataService.updateConfig(body.city, body.latitude, body.longitude);
  }
}
