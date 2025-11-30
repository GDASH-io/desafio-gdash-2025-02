import { httpClient } from "./httpClient";

type WeatherDataItem = {
  date: string;
  hour: string;
  interval: { value: number; unit: string };
  temperature_2m: { value: number; unit: string };
  relative_humidity_2m: { value: number; unit: string };
  precipitation_probability: { value: number; unit: string };
  precipitation: { value: number; unit: string };
  rain: { value: number; unit: string };
  weather_code: { value: number; unit: string };
  pressure_msl: { value: number; unit: string };
  cloud_cover: { value: number; unit: string };
  visibility: { value: number; unit: string };
  evapotranspiration: { value: number; unit: string };
  et0_fao_evapotranspiration: { value: number; unit: string };
  wind_speed_10m: { value: number; unit: string };
  wind_speed_80m: { value: number; unit: string };
  wind_speed_120m: { value: number; unit: string };
  wind_direction_10m: { value: number; unit: string };
  wind_direction_80m: { value: number; unit: string };
  wind_direction_120m: { value: number; unit: string };
  wind_speed_180m: { value: number; unit: string };
  wind_direction_180m: { value: number; unit: string };
  wind_gusts_10m: { value: number; unit: string };
  temperature_80m: { value: number; unit: string };
  temperature_120m: { value: number; unit: string };
  temperature_180m: { value: number; unit: string };
  is_day: { value: number; unit: string };
  uv_index: { value: number; unit: string };
  uv_index_clear_sky: { value: number; unit: string };
  direct_radiation: { value: number; unit: string };
};

export class WeatherService {
  static async getWeather(signal?: AbortSignal) {
    const { data, status } =
      await httpClient.get<WeatherService.GetWeatherOutput>("/weather/latest", { signal });

    return status === 200 ? data : undefined;
  }

  static async getWeathers(signal?: AbortSignal) {
    const { data, status } =
      await httpClient.get<WeatherService.GetWeathersOutput>("/weather", { signal });
    return status === 200 ? data.data : undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async exportWeathersToCsv(_signal?: AbortSignal) {
    const { headers, data } =
      await httpClient.get<WeatherService.ExportWeatherCSVOutput>(
        "/weather/export/csv",
        {
          responseType: "blob"
        }
      );
    const contentDisposition = headers["content-disposition"];

    const filename = contentDisposition
      ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
      : "weathers.csv";

    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async exportWeathersToXlsx(_signal?: AbortSignal) {
    console.log("Exporting weathers to XLSX...");
    const { headers, data } =
      await httpClient.get<WeatherService.ExportWeatherXLSXOutput>(
        "/weather/export/xlsx",
        {
          responseType: "blob",
        }
      );
    const contentDisposition = headers["content-disposition"];

    const filename = contentDisposition
      ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
      : "weathers.xlsx";

    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace WeatherService {
  type Insight =
    | {
        description: string;
        activities: string[];
      }
    | undefined;

  export type GetWeatherOutput = { data: WeatherDataItem; insight: Insight };
  export type GetWeathersOutput = { data: WeatherDataItem[] };

  export type ExportWeatherCSVOutput = Blob;
  export type ExportWeatherXLSXOutput = Blob;
}
