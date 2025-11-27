import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WeatherConfigService } from './config.service';
import { UpdateLocationConfigDto } from './dto/update-location-config.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('config')
@Controller('api/config')
export class ConfigController {
  constructor(private readonly configService: WeatherConfigService) {}

  @Get('location')
  @ApiOperation({ summary: 'Get current location configuration' })
  @ApiResponse({ status: 200, description: 'Current location configuration' })
  getCurrentLocationConfig() {
    return this.configService.getCurrentLocationConfig();
  }

  @Post('location')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update location configuration' })
  @ApiResponse({ status: 200, description: 'Location configuration updated' })
  updateLocationConfig(@Body() updateLocationConfigDto: UpdateLocationConfigDto) {
    return this.configService.updateLocationConfig(updateLocationConfigDto);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get collector status' })
  @ApiResponse({ status: 200, description: 'Collector status information' })
  getCollectorStatus() {
    return this.configService.getCollectorStatus();
  }
}