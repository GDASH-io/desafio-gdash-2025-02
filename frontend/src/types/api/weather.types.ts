
interface ChartData {
  date: string;
  tmin: number;
  tmax: number;
}

// Tipagem dos dados vindos da API
export interface WeatherLog {
  _id: string;
  location: string;
  temperature_c: number;
  humidity_percent: number;
  wind_speed_kmh: number;
  condition: string;
  timestamp: number;

  insights?: {
    next_7_days?: {
      date: string;
      tmin: number;
      tmax: number;
      rain: number;
      wmo: number;
      icon: string;
      daily_tips: string[];
      trend_temperature: string;
      solar_radiation?: number;
      estimated_generation_kwh?: number;
      solar_efficiency?: number;
      uv_index?: number;
      uv_level?: string;
      solar_recommendations?: string[];
    }[];
    temperature_trend_chart?: {
      data: ChartData[],
      trend: {
        tmin: {
          slope: number,
          direction: 'increasing' | 'decreasing' | 'stable'
        },
        tmax: {
          slope: number,
          direction: 'increasing' | 'decreasing' | 'stable'
        }
      }
    };
    solar_best_day?: {
      date: string;
      radiation_wh_m2: number;
      estimated_kwh: number;
    };
    comfort_now?: number;
    solar_efficiency_index?: number;
    today_sun_exposure?: number;
    solar_recommendation?: string;
    uv_alert?: string;
  };

  createdAt: string;
}