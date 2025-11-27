import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LocationService } from './location.service';
import { LocationData } from './interfaces/location-data.interface';

@ApiTags('location')
@Controller('api/location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('by-cep')
  @ApiOperation({ summary: 'Get location by CEP' })
  @ApiResponse({ status: 200, description: 'Location found' })
  @ApiResponse({ status: 400, description: 'Invalid CEP' })
  async getLocationByCep(@Query('cep') cep: string): Promise<LocationData> {
    return this.locationService.getLocationByCep(cep);
  }

  @Get('by-ip')
  @ApiOperation({ summary: 'Get location by IP (auto-detect if no IP provided)' })
  @ApiResponse({ status: 200, description: 'Location detected' })
  async getLocationByIP(@Query('ip') ip: string | undefined): Promise<LocationData> {
    return this.locationService.getLocationByIP(ip);
  }

  @Get('by-city')
  @ApiOperation({ summary: 'Get location by city name' })
  @ApiResponse({ status: 200, description: 'Location found by city name' })
  @ApiResponse({ status: 400, description: 'City not found' })
  async getLocationByCity(@Query('city') city: string): Promise<LocationData> {
    return this.locationService.getLocationByCity(city);
  }

  @Get('coordinates')
  @ApiOperation({ summary: 'Get coordinates for a city' })
  @ApiResponse({ status: 200, description: 'Coordinates found' })
  async getCityCoordinates(
    @Query('city') city: string,
    @Query('country') countryCode: string = 'BR'
  ) {
    return this.locationService.getCitiesCoordinates(city, countryCode);
  }
}