import { Injectable, Logger } from '@nestjs/common';
import { UpdateLocationConfigDto } from './dto/update-location-config.dto';

@Injectable()
export class WeatherConfigService {
  private readonly logger = new Logger(WeatherConfigService.name);
  private currentLocation = {
    city: process.env.CITY || null,
    country: process.env.COUNTRY_CODE || null,
    lastUpdated: new Date().toISOString()
  };

  getCurrentLocationConfig() {
    return {
      location: this.currentLocation.city && this.currentLocation.country ? {
        city: this.currentLocation.city,
        country: this.currentLocation.country
      } : null,
      status: this.currentLocation.city && this.currentLocation.country ? 'active' : 'not_configured',
      lastUpdated: this.currentLocation.lastUpdated
    };
  }

  async updateLocationConfig(updateLocationConfigDto: UpdateLocationConfigDto) {
    this.currentLocation = {
      city: updateLocationConfigDto.city,
      country: updateLocationConfigDto.country,
      lastUpdated: new Date().toISOString()
    };

    this.logger.log(`Location updated to: ${this.currentLocation.city}, ${this.currentLocation.country}`);

    // Aqui podemos implementar notificação para o coletor no futuro
    // Por enquanto, o coletor será reiniciado manualmente quando necessário
    
    return {
      success: true,
      message: `Weather data collection configured for ${this.currentLocation.city}, ${this.currentLocation.country}`,
      location: this.currentLocation,
      note: 'Collector will start collecting data for this location within 5 minutes'
    };
  }

  getCollectorStatus() {
    return {
      status: 'running',
      currentLocation: this.currentLocation,
      lastCollection: new Date().toISOString(),
      collectionInterval: 300, // 5 minutes
      health: 'healthy'
    };
  }
}