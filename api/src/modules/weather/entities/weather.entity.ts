import { formatDate } from 'src/utils/formatDate';
import { CreateWeatherDto } from '../dto/create-weather.dto';
import {
  WeatherDataItem,
  WeatherDocument,
} from '../infraestructure/schema/weather.schema';

class CurrentUnits {
  public readonly interval: string;
  public readonly temperature_2m: string;
  public readonly relative_humidity_2m: string;
  public readonly precipitation_probability: string;
  public readonly precipitation: string;
  public readonly rain: string;
  public readonly weather_code: string;
  public readonly pressure_msl: string;
  public readonly cloud_cover: string;
  public readonly visibility: string;
  public readonly evapotranspiration: string;
  public readonly et0_fao_evapotranspiration: string;
  public readonly wind_speed_10m: string;
  public readonly wind_speed_80m: string;
  public readonly wind_speed_120m: string;
  public readonly wind_direction_10m: string;
  public readonly wind_direction_80m: string;
  public readonly wind_direction_120m: string;
  public readonly wind_speed_180m: string;
  public readonly wind_direction_180m: string;
  public readonly wind_gusts_10m: string;
  public readonly temperature_80m: string;
  public readonly temperature_120m: string;
  public readonly temperature_180m: string;
  public readonly is_day: string;
  public readonly uv_index: string;
  public readonly uv_index_clear_sky: string;
  public readonly direct_radiation: string;
}

class CurrentValues {
  public readonly interval: number;
  public readonly temperature_2m: number;
  public readonly relative_humidity_2m: number;
  public readonly precipitation_probability: number;
  public readonly precipitation: number;
  public readonly rain: number;
  public readonly weather_code: number;
  public readonly pressure_msl: number;
  public readonly cloud_cover: number;
  public readonly visibility: number;
  public readonly evapotranspiration: number;
  public readonly et0_fao_evapotranspiration: number;
  public readonly wind_speed_10m: number;
  public readonly wind_speed_80m: number;
  public readonly wind_speed_120m: number;
  public readonly wind_direction_10m: number;
  public readonly wind_direction_80m: number;
  public readonly wind_direction_120m: number;
  public readonly wind_speed_180m: number;
  public readonly wind_direction_180m: number;
  public readonly wind_gusts_10m: number;
  public readonly temperature_80m: number;
  public readonly temperature_120m: number;
  public readonly temperature_180m: number;
  public readonly is_day: number;
  public readonly uv_index: number;
  public readonly uv_index_clear_sky: number;
  public readonly direct_radiation: number;
}

export class Weather {
  public readonly date: string;
  public readonly current_units: CurrentUnits;
  public readonly current: CurrentValues;
  constructor(dto: CreateWeatherDto) {
    this.date = formatDate({ onlyDate: true });
    this.current_units = dto.current_units;
    this.current = dto.current;
  }

  formattedWeatherDataToSchema(): WeatherDataItem {
    const formattedData = {} as WeatherDataItem;
    for (const key in this.current_units) {
      const unit = `${this.current[key as keyof CurrentValues]} ${this.current_units[key]}`;
      const value = this.current[key as keyof CurrentValues];
      formattedData[key] = {
        value,
        unit,
      };
    }

    formattedData.date = formatDate({ onlyDate: true });
    formattedData.hour = formatDate({ onlyHour: true });

    return formattedData;
  }

  static formattedItemsToCsv(
    data: WeatherDataItem[],
  ): Record<string, string>[] {
    return data.map((item) => ({
      date: item.date,
      hour: item.hour,
      interval: item.interval.unit,
      temperature_2m: item.temperature_2m.unit,
      relative_humidity_2m: item.relative_humidity_2m.unit,
      precipitation_probability: item.precipitation_probability.unit,
      precipitation: item.precipitation.unit,
      rain: item.rain.unit,
      weather_code: item.weather_code.unit,
      pressure_msl: item.pressure_msl.unit,
      cloud_cover: item.cloud_cover.unit,
      visibility: item.visibility.unit,
      evapotranspiration: item.evapotranspiration.unit,
      et0_fao_evapotranspiration: item.et0_fao_evapotranspiration.unit,
      wind_speed_180m: item.wind_speed_180m.unit,
      wind_direction_180m: item.wind_direction_180m.unit,
      wind_gusts_10m: item.wind_gusts_10m.unit,
      temperature_180m: item.temperature_180m.unit,
      uv_index_clear_sky: item.uv_index_clear_sky.unit,
      direct_radiation: item.direct_radiation.unit,
    }));
  }

  static formattedItemsToXlsx(
    data: WeatherDataItem[],
  ): Record<string, string | StringConstructor>[][] | undefined {
    if (!data.length) return undefined;

    const headers = [
      { value: 'DATE', fontWeight: 'bold' },
      { value: 'HOUR', fontWeight: 'bold' },
      { value: 'INTERVAL', fontWeight: 'bold' },
      { value: 'TEMPERATURE_2M', fontWeight: 'bold' },
      { value: 'RELATIVE_HUMIDITY_2M', fontWeight: 'bold' },
      { value: 'PRECIPITATION_PROBABILITY', fontWeight: 'bold' },
      { value: 'PRECIPITATION', fontWeight: 'bold' },
      { value: 'RAIN', fontWeight: 'bold' },
      { value: 'WEATHER_CODE', fontWeight: 'bold' },
      { value: 'PRESSURE_MSL', fontWeight: 'bold' },
      { value: 'CLOUD_COVER', fontWeight: 'bold' },
      { value: 'VISIBILITY', fontWeight: 'bold' },
      { value: 'EVAPOTRANSPIRATION', fontWeight: 'bold' },
      { value: 'ET0_FAO_EVAPOTRANSPIRATION', fontWeight: 'bold' },
      { value: 'WIND_SPEED_10M', fontWeight: 'bold' },
      { value: 'WIND_SPEED_80M', fontWeight: 'bold' },
      { value: 'WIND_SPEED_120M', fontWeight: 'bold' },
      { value: 'WIND_DIRECTION_10M', fontWeight: 'bold' },
      { value: 'WIND_DIRECTION_80M', fontWeight: 'bold' },
      { value: 'WIND_DIRECTION_120M', fontWeight: 'bold' },
    ];

    const rows = data.map((item) => [
      {
        type: String,
        value: item.date,
      },
      {
        type: String,
        value: item.hour,
      },
      {
        type: String,
        value: item.interval.unit,
      },
      {
        type: String,
        value: item.temperature_2m.unit,
      },
      {
        type: String,
        value: item.relative_humidity_2m.unit,
      },
      {
        type: String,
        value: item.precipitation_probability.unit,
      },
      {
        type: String,
        value: item.precipitation.unit,
      },
      {
        type: String,
        value: item.rain.unit,
      },
      {
        type: String,
        value: item.weather_code.unit,
      },
      {
        type: String,
        value: item.pressure_msl.unit,
      },
      {
        type: String,
        value: item.cloud_cover.unit,
      },
      {
        type: String,
        value: item.visibility.unit,
      },
      {
        type: String,
        value: item.evapotranspiration.unit,
      },
      {
        type: String,
        value: item.et0_fao_evapotranspiration.unit,
      },
      {
        type: String,
        value: item.wind_speed_180m.unit,
      },
      {
        type: String,
        value: item.wind_direction_180m.unit,
      },
      {
        type: String,
        value: item.wind_gusts_10m.unit,
      },
      {
        type: String,
        value: item.temperature_180m.unit,
      },
      {
        type: String,
        value: item.uv_index_clear_sky.unit,
      },
      {
        type: String,
        value: item.direct_radiation.unit,
      },
    ]);

    return [headers, ...rows];
  }

  toSchema(): WeatherDocument {
    const formattedData = this.formattedWeatherDataToSchema();

    return {
      date: this.date,
      data: [formattedData],
      insight: {
        activities: [],
        description: '',
      },
      embedding: [],
    };
  }
}

export function CreateWeatherEntity(dto: CreateWeatherDto): Weather {
  return new Weather(dto);
}
