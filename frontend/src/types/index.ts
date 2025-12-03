// ==========================================
// AUTH
// ==========================================
export interface User {
  _id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

// ==========================================
// WEATHER
// ==========================================
export interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

export interface WeatherLog {
  _id: string;
  timestamp: string;
  location: Location;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  rainProbability?: number;
  feelsLike?: number;
  pressure?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WeatherStats {
  totalRecords: number;
  temperature: {
    avg: number;
    min: number;
    max: number;
  };
  humidity: {
    avg: number;
    min: number;
    max: number;
  };
  windSpeed: {
    avg: number;
    min: number;
    max: number;
  };
}

// ==========================================
// INSIGHTS
// ==========================================
export type InsightType = 'alert' | 'trend' | 'summary' | 'recommendation';
export type InsightSeverity = 'info' | 'warning' | 'danger';

export interface Insight {
  _id: string;
  type: InsightType;
  title: string;
  content: string;
  severity: InsightSeverity;
  metadata?: {
    startDate?: string;
    endDate?: string;
    dataPointsAnalyzed?: number;
    avgTemperature?: number;
    avgHumidity?: number;
  };
  generatedAt: string;
}

// ==========================================
// EXTERNAL API (Pokémon)
// ==========================================
export interface Pokemon {
  id: number;
  name: string;
  types: Array<{
    type: {
      name: string;
    };
  }>;
  height: number;
  weight: number;
  abilities: Array<{
    ability: {
      name: string;
    };
  }>;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
}

// ==========================================
// EXTERNAL API (Star Wars)
// ==========================================
export interface StarWarsCharacter {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
  homeworld: string;
  films: string[];
  species: string[];
  vehicles: string[];
  starships: string[];
  created: string;
  edited: string;
  url: string;
}

export interface StarWarsPlanet {
  name: string;
  climate: string;
  terrain: string;
  population: string;
}

// ==========================================
// PAGINATION
// ==========================================
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}