import { Inject, Injectable } from '@nestjs/common';
import { WeatherDataItem } from 'src/modules/weather/infraestructure/schema/weather.schema';
import { WeatherRepositoryPort } from 'src/modules/weather/ports/weather.repository.ports';
import { commonConstants } from 'src/shared/constants';
import {
  AnalyticsServicePorts,
  ComparativeAnalyticsByDayResult,
  ComparativeAnalyticsByHourResult,
  TemperatureAnalyticsByDayResult,
  TemperatureAnalyticsByHourResult,
  WindSpeedAnalyticsByDayResult,
  WindSpeedAnalyticsByHourResult,
} from '../../ports/analytics.port';

@Injectable()
export class AnalyticsAdapters implements AnalyticsServicePorts {
  constructor(
    @Inject(commonConstants.ports.WEATHER)
    private readonly weatherService: WeatherRepositoryPort,
  ) {}

  async getTemperatureAnalyticsByHour(
    date?: string,
  ): Promise<TemperatureAnalyticsByHourResult[]> {
    const weathers = await this.weatherService.getWeathers(date);
    if (!weathers) {
      return [];
    }

    return weathers.map((weather) => {
      const averageTemp = this.calculateAverage(weather, 'temperature');

      return {
        hour: weather.hour,
        temperature: Number(averageTemp.toFixed(1)),
      };
    });
  }

  async getWindSpeedAnalyticsByHour(
    date?: string,
  ): Promise<WindSpeedAnalyticsByHourResult[]> {
    const weathers = await this.weatherService.getWeathers(date);
    if (!weathers) {
      return [];
    }

    return weathers.map((weather) => {
      const averageWindSpeed = this.calculateAverage(weather, 'windSpeed');

      return {
        hour: weather.hour,
        windSpeed: Number(averageWindSpeed.toFixed(1)),
      };
    });
  }

  async getTemperatureAnalyticsByDay(
    limit?: number,
  ): Promise<TemperatureAnalyticsByDayResult[]> {
    const weathers = await this.weatherService.getAllWeathers(limit);
    if (!weathers) {
      return [];
    }

    return weathers.map((weather) => {
      const averageTemp = weather.data.reduce((sum, item) => {
        const itemAvg = this.calculateAverage(item, 'temperature');
        return sum + itemAvg;
      }, 0);

      return {
        date: weather.date,
        temperature: Number((averageTemp / weather.data.length).toFixed(1)),
      };
    });
  }

  async getWindSpeedAnalyticsByDay(
    limit?: number,
  ): Promise<WindSpeedAnalyticsByDayResult[]> {
    const weathers = await this.weatherService.getAllWeathers(limit);
    if (!weathers) {
      return [];
    }

    return weathers.map((weather) => {
      const averageWindSpeed = weather.data.reduce((sum, item) => {
        const itemAvg = this.calculateAverage(item, 'windSpeed');
        return sum + itemAvg;
      }, 0);

      return {
        date: weather.date,
        windSpeed: Number((averageWindSpeed / weather.data.length).toFixed(1)),
      };
    });
  }

  async getComparativeAnalyticsByHour(
    date?: string,
  ): Promise<ComparativeAnalyticsByHourResult[]> {
    const weathers = await this.weatherService.getWeathers(date);
    if (!weathers) {
      return [];
    }

    return weathers.map((weather) => {
      const averageTemp = this.calculateAverage(weather, 'temperature');
      const averageWindSpeed = this.calculateAverage(weather, 'windSpeed');

      return {
        hour: weather.hour,
        temperature: Number(averageTemp.toFixed(1)),
        windSpeed: Number(averageWindSpeed.toFixed(1)),
      };
    });
  }

  async getComparativeAnalyticsByDay(
    limit?: number,
  ): Promise<ComparativeAnalyticsByDayResult[]> {
    const weathers = await this.weatherService.getAllWeathers(limit);
    if (!weathers) {
      return [];
    }

    return weathers.map((weather) => {
      const averageWindSpeed = weather.data.reduce(
        (sum, item) => {
          const windAvg = this.calculateAverage(item, 'windSpeed');
          const tempAvg = this.calculateAverage(item, 'temperature');
          sum.windAvg += windAvg;
          sum.tempAvg += tempAvg;
          return sum;
        },
        { tempAvg: 0, windAvg: 0 },
      );

      return {
        date: weather.date,
        windSpeed: Number(
          (averageWindSpeed.windAvg / weather.data.length).toFixed(1),
        ),
        temperature: Number(
          (averageWindSpeed.tempAvg / weather.data.length).toFixed(1),
        ),
      };
    });
  }

  private calculateAverage(
    data: WeatherDataItem,
    type: 'temperature' | 'windSpeed',
  ): number {
    if (type === 'windSpeed') {
      const wind1 = data.wind_speed_10m.value;
      const wind2 = data.wind_speed_80m.value;
      const wind3 = data.wind_speed_120m.value;
      const wind4 = data.wind_speed_180m.value;

      const averageWindSpeed = (wind1 + wind2 + wind3 + wind4) / 4;

      return averageWindSpeed;
    } else {
      const temp1 = data.temperature_2m.value;
      const temp2 = data.temperature_80m.value;
      const temp3 = data.temperature_120m.value;
      const temp4 = data.temperature_180m.value;

      const averageTemp = (temp1 + temp2 + temp3 + temp4) / 4;
      return averageTemp;
    }
  }
}
