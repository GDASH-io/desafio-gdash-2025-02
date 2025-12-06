import { ICurrentWeather } from '@/db/models/currentWeatcher';
import { getDailyWeatherAll, IDailyWeather } from '@/db/models/dailyWeather';
import { IHourlyWeather } from '@/db/models/hourlyWeather';
import * as XLSX from 'xlsx';

export function FormatHourlyWeatherToCsv(data: IHourlyWeather[]): string {
  const formattedData = data.map((item: any) => ({
    time: item.time.toLocaleString("pt-BR"),
    temperature2m: item.temperature2m,
    relativeHumidity2m: item.relativeHumidity2m,
    apparentTemperature: item.apparentTemperature,
    precipitationProbability: item.precipitationProbability,
    precipitation: item.precipitation,
    weatherCode: item.weatherCode,
    cloudCover: item.cloudCover,
    windSpeed10m: item.windSpeed10m,
    windGusts10m: item.windGusts10m,
    visibility: item.visibility,
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Hourly Data");

  const buf = XLSX.write(workbook, { type: "string", bookType: "csv" });
  return buf
}

export function FormatDate(date: Date) {
  const parts = date.toLocaleDateString("pt-BR").split("/")
  return `${parts[0]}/${parts[1]}`
}

export function FormatDailyWeatherToCsv(data: IDailyWeather[]): string {
  const formattedData = data.map((item) => {

    return {
      date: FormatDate(item.time),
      weatherCode: item.weatherCode,
      temperature2mMax: item.temperature2mMax,
      temperature2mMin: item.temperature2mMin,
      temperature2mMean: item.temperature2mMean,
      apparentTemperatureMax: item.apparentTemperatureMax,
      apparentTemperatureMin: item.apparentTemperatureMin,
      sunrise: item.sunrise,
      sunset: item.sunset,
      uvIndexMax: item.uvIndexMax,
      precipitationSum: item.precipitationSum,
      precipitationHours: item.precipitationHours,
      precipitationProbabilityMax: item.precipitationProbabilityMax,
      windGusts10mMax: item.windGusts10mMax,
      sunshineDuration: item.sunshineDuration,
      relativeHumidity2mMax: item.relativeHumidity2mMax,
      cloudCoverMean: item.cloudCoverMean,
      capeMax: item.capeMax,
    }
  });

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Day Data");

  const buf = XLSX.write(workbook, { type: "string", bookType: "csv" });
  return buf
}

export function FormatCurrentWeatherToCsv(data: ICurrentWeather): string {
  const formattedData = [{
    time: data.time.toLocaleString("pt-BR"),
    temperature2m: data.temperature2m,
    relativeHumidity2m: data.relativeHumidity2m,
    apparentTemperature: data.apparentTemperature,
    isDay: data.isDay,
    precipitation: data.precipitation,
    weatherCode: data.weatherCode,
    cloudCover: data.cloudCover,
    windSpeed10m: data.windSpeed10m,
    windDirection10m: data.windDirection10m,
    windGusts10m: data.windGusts10m
  }]
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Day Data");

  const buf = XLSX.write(workbook, { type: "string", bookType: "csv" });
  return buf
}