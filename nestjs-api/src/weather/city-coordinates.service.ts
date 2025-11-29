import { Injectable } from '@nestjs/common';

export interface CityCoordinates {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
}

@Injectable()
export class CityCoordinatesService {
  private readonly citiesMap: Map<string, CityCoordinates> = new Map([
    ['Anchorage', { latitude: 61.2181, longitude: -149.9003, name: 'Anchorage', country: 'USA' }],
    ['Oslo', { latitude: 59.9139, longitude: 10.7522, name: 'Oslo', country: 'Norway' }],
    ['Sapporo', { latitude: 43.0642, longitude: 141.3469, name: 'Sapporo', country: 'Japan' }],
    ['Reykjavik', { latitude: 64.1466, longitude: -21.9426, name: 'Reykjavik', country: 'Iceland' }],
    ['Stockholm', { latitude: 59.3293, longitude: 18.0686, name: 'Stockholm', country: 'Sweden' }],
    
    ['London', { latitude: 51.5074, longitude: -0.1278, name: 'London', country: 'UK' }],
    ['Tokyo', { latitude: 35.6762, longitude: 139.6503, name: 'Tokyo', country: 'Japan' }],
    ['Seattle', { latitude: 47.6062, longitude: -122.3321, name: 'Seattle', country: 'USA' }],
    ['Mumbai', { latitude: 19.0760, longitude: 72.8777, name: 'Mumbai', country: 'India' }],
    ['Manaus', { latitude: -3.1190, longitude: -60.0217, name: 'Manaus', country: 'Brazil' }],
    
    ['Dubai', { latitude: 25.2048, longitude: 55.2708, name: 'Dubai', country: 'UAE' }],
    ['Sydney', { latitude: -33.8688, longitude: 151.2093, name: 'Sydney', country: 'Australia' }],
    ['Cairo', { latitude: 30.0444, longitude: 31.2357, name: 'Cairo', country: 'Egypt' }],
    ['Moscow', { latitude: 55.7558, longitude: 37.6173, name: 'Moscow', country: 'Russia' }],
    ['Bangkok', { latitude: 13.7563, longitude: 100.5018, name: 'Bangkok', country: 'Thailand' }],
    
    ['Salvador', { latitude: -12.9714, longitude: -38.5014, name: 'Salvador', country: 'Brazil' }],
    ['São Paulo', { latitude: -23.5505, longitude: -46.6333, name: 'São Paulo', country: 'Brazil' }],
    ['Rio de Janeiro', { latitude: -22.9068, longitude: -43.1729, name: 'Rio de Janeiro', country: 'Brazil' }],
    ['Fortaleza', { latitude: -3.7172, longitude: -38.5433, name: 'Fortaleza', country: 'Brazil' }],
    ['Recife', { latitude: -8.0476, longitude: -34.8770, name: 'Recife', country: 'Brazil' }],
    ['Brasília', { latitude: -15.7942, longitude: -47.8822, name: 'Brasília', country: 'Brazil' }],
    ['Curitiba', { latitude: -25.4284, longitude: -49.2733, name: 'Curitiba', country: 'Brazil' }],
  ]);

  getCoordinates(cityName: string): CityCoordinates | null {
    const normalized = this.normalizeCityName(cityName);
    
    if (this.citiesMap.has(normalized)) {
      return this.citiesMap.get(normalized)!;
    }
    
    for (const [key, value] of this.citiesMap.entries()) {
      if (key.toLowerCase() === normalized.toLowerCase()) {
        return value;
      }
    }
    
    for (const [key, value] of this.citiesMap.entries()) {
      if (key.toLowerCase().includes(normalized.toLowerCase()) || 
          normalized.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    
    return null;
  }

  getAllCities(): CityCoordinates[] {
    return Array.from(this.citiesMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  }

  searchCities(query: string): CityCoordinates[] {
    const normalizedQuery = this.normalizeCityName(query).toLowerCase();
    
    return Array.from(this.citiesMap.values())
      .filter(city => 
        city.name.toLowerCase().includes(normalizedQuery) ||
        city.country.toLowerCase().includes(normalizedQuery)
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 10); 
  }

  getCityByCoordinates(latitude: number, longitude: number, tolerance: number = 0.5): CityCoordinates | null {
    for (const city of this.citiesMap.values()) {
      const latDiff = Math.abs(city.latitude - latitude);
      const lonDiff = Math.abs(city.longitude - longitude);
      
      if (latDiff <= tolerance && lonDiff <= tolerance) {
        return city;
      }
    }
    
    return null;
  }

  private normalizeCityName(cityName: string): string {
    return cityName.trim()
      .replace(/\s+/g, ' ') 
      .replace(/^São\s+/, 'São ') 
      .replace(/^Rio\s+de\s+Janeiro/i, 'Rio de Janeiro');
  }
}

