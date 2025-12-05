import { InjectModel } from '@nestjs/mongoose';
import { Weather, WeatherDocument } from './schema/weather.schema';
import { Model } from 'mongoose';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { jsonToXLSX } from 'src/helpers/jsonToXLSX';
import { IaService } from 'src/ia/ia.service';


export type WeatherData = {
  cityName: string,
  temperature: number,
  humidity: number,
  windSpeed: number,
  cloudCover: number,
  precipitation: number,
  time: string,
  date: string,
  apparentTemperature: number,
  rain: number,
  isDay: number,
  dailyInfo?: {
    days: string[],
    tempMin: number[],
    tempMax: number[],
    uvIndex: number[],
    solarRadiation: number[]
  }
}

export type ResponseProps = {
  success: boolean;
  message: string | object;
  STATUS_CODE: number
}

@Injectable()
export class WeatherService {

  constructor(
    @InjectModel(Weather.name) private readonly weatherModel: Model<WeatherDocument>,
    private readonly iaService: IaService
  ) { }

  async getWeather(): Promise<ResponseProps> {
    try {
      const mongoResponse = (await this.weatherModel.aggregate([
        { $sort: { "createdAt": -1 } },
        { $limit: 100 },
        {
          $group: {
            "_id": "$date",
            "latestDocument": { $first: "$$ROOT" },
            "allDailyInfo": {
              $push: {
                $cond: [
                  { $ifNull: ["$dailyInfo", false] },
                  "$dailyInfo",
                  "$$REMOVE"
                ]
              }
            }
          }
        },
        { $sort: { "_id": -1 } },
        { $limit: 1 },
        {
          $project: {
            "cityName": "$latestDocument.cityName",
            "temperature": "$latestDocument.temperature",
            "humidity": "$latestDocument.humidity",
            "windSpeed": "$latestDocument.windSpeed",
            "cloudCover": "$latestDocument.cloudCover",
            "precipitation": "$latestDocument.precipitation",
            "time": "$latestDocument.time",
            "date": "$latestDocument.date",
            "apparentTemperature": "$latestDocument.apparentTemperature",
            "rain": "$latestDocument.rain",
            "isDay": "$latestDocument.isDay",
            "createdAt": "$latestDocument.createdAt",
            "updatedAt": "$latestDocument.updatedAt",
            "dailyInfo": {
              $ifNull: [
                "$latestDocument.dailyInfo",
                { $arrayElemAt: ["$allDailyInfo", 0] }
              ]
            }
          }
        }
      ]))[0]

      if (!mongoResponse) {
        Logger.warn("Sem dados sobre o clima no banco de dados")
        return { success: false, message: "Sem dados", STATUS_CODE: HttpStatus.BAD_GATEWAY };
      }
      const dataToSend: WeatherData = {
        cityName: mongoResponse["cityName"],
        temperature: mongoResponse["temperature"],
        humidity: mongoResponse["humidity"],
        windSpeed: mongoResponse["windSpeed"],
        cloudCover: mongoResponse["cloudCover"],
        precipitation: mongoResponse["precipitation"],
        time: mongoResponse["time"],
        date: mongoResponse["date"],
        apparentTemperature: mongoResponse["apparentTemperature"],
        rain: mongoResponse["rain"],
        isDay: mongoResponse["isDay"],
        dailyInfo: {
          days: mongoResponse["dailyInfo"]["days"],
          tempMin: mongoResponse["dailyInfo"]["tempMin"],
          tempMax: mongoResponse["dailyInfo"]["tempMax"],
          uvIndex: mongoResponse["dailyInfo"]["uvIndex"],
          solarRadiation: mongoResponse["dailyInfo"]["solarRadiation"]
        }
      }
      return { success: true, message: dataToSend, STATUS_CODE: HttpStatus.OK }
    } catch (err) {
      Logger.error("Falha ao buscar pelos dados do clima no banco de dados")
      Logger.error(err.message)
      return { success: false, message: "Falha ao buscar pelo clima", STATUS_CODE: HttpStatus.INTERNAL_SERVER_ERROR }
    }
  }

  async getWeatherLogs(params: object): Promise<ResponseProps> {
    try {
      const mongoResponse: WeatherData[] = await this.weatherModel.find(params).select("-coordinates -_id -__v -createdAt -updatedAt -cityName")
      if (!mongoResponse) {
        Logger.warn("Sem dados sobre o clima no banco de dados")
        return { success: false, message: "Sem dados", STATUS_CODE: HttpStatus.BAD_GATEWAY };
      }

      return { success: true, message: mongoResponse, STATUS_CODE: HttpStatus.OK }
    } catch (err) {
      Logger.error("Falha ao buscar pelos dados do clima no banco de dados")
      Logger.error(err.message)
      return { success: false, message: "Falha ao buscar pelo clima", STATUS_CODE: HttpStatus.INTERNAL_SERVER_ERROR }
    }
  }

  async getXLSX(): Promise<ResponseProps> {
    const weatherData = await this.getWeather();
    if (weatherData.STATUS_CODE !== 200) {
      Logger.error("Falha ao tentar gerar XLSX");
      return { ...weatherData, message: "Falha ao tentar gerar XLSX", STATUS_CODE: weatherData.STATUS_CODE };
    }
    console.log("requisitou")
    const xlsx = jsonToXLSX([weatherData.message as object])

    return { success: true, message: xlsx, STATUS_CODE: weatherData.STATUS_CODE }
  }

  async saveWeatherData(weather: WeatherData): Promise<ResponseProps> {
    Logger.log(weather)
    const weatherData = new this.weatherModel({
      cityName: weather.cityName,
      temperature: weather.temperature,
      humidity: weather.humidity,
      windSpeed: weather.windSpeed,
      cloudCover: weather.cloudCover,
      precipitation: weather.precipitation,
      time: weather.time,
      date: weather.date,
      apparentTemperature: weather.apparentTemperature,
      rain: weather.rain,
      isDay: weather.isDay,
    })

    if (weather.dailyInfo) {
      weatherData.dailyInfo = {
        days: weather.dailyInfo.days,
        tempMin: weather.dailyInfo.tempMin,
        tempMax: weather.dailyInfo.tempMax,
        solarRadiation: weather.dailyInfo.solarRadiation,
        uvIndex: weather.dailyInfo.uvIndex
      }
    }

    try {
      await weatherData.save()
      Logger.log("✓ Dados salvos no banco de dados")
      return { success: true, message: "Dados salvos no banco de dados", STATUS_CODE: HttpStatus.CREATED }
    } catch (err) {
      Logger.error("✕ Falha ao salvar clima no banco de dados...")
      Logger.warn(err.message)
      return { success: false, message: "Falha ao salvar o clima no banco de dados", STATUS_CODE: HttpStatus.INTERNAL_SERVER_ERROR }
    }
  }

  async getLastWeekTemperatures(): Promise<ResponseProps> {
    const today = new Date();
    today.setDate(today.getDate() - 7)
    const lastSevenDays = today.toISOString().slice(0, 10) + "T00:00:00-03:00"
    try {
      const mongoResponse = await this.weatherModel.aggregate([
        {
          $match: {
            "date": {
              $gte: lastSevenDays
            }
          },
        },
        {
          $group: {
            _id: "$date",
            temperatures: { $push: "$temperature" }
          }
        },
        {$sort: {"_id": 1}}
      ])
      const dataToSend = mongoResponse.map((res) => ({ date: res._id, temperatures: res.temperatures }))
      return { success: true, message: dataToSend, STATUS_CODE: HttpStatus.OK }
    } catch (err) {
      Logger.error("Falha ao buscar pelas temperaturas da última semana")
      Logger.error(err.message);
      return {
        success: false,
        message: "Falha ao buscar pelas temperaturas da útlima semana",
        STATUS_CODE: HttpStatus.INTERNAL_SERVER_ERROR
      }
    }
  }

  async getLastWeekPrecXHumid(): Promise<ResponseProps> {
    try {
      const today = new Date();
      today.setDate(today.getDate() - 7)
      const lastSevenDays = today.toISOString().slice(0, 10) + "T00:00:00-03:00"
      const mongoResponse = await this.weatherModel.aggregate([
        {
          $match: {
            "date": {
              $gte: lastSevenDays
            }
          }
        },
        {
          $group: {
            _id: "$date",
            humidities: { $push: "$humidity" },
            precipitations: { $push: "$precipitation" }
          }
        },
        {$sort: {"_id": 1}}
      ]);
      const dataToSend = mongoResponse.map(res => ({ 
        date: res._id, 
        humidities: res.humidities, 
        precipitations: res.precipitations
      }));
      return { success: true, message: dataToSend, STATUS_CODE: HttpStatus.OK }
    } catch(err) {
      Logger.error("Erro ao buscar dados da precipitação e humidade da última semana");
      Logger.error(err.message);
      return {
        success: false, 
        message: "Erro ao buscar dados de precpitação e humidade da última semana", 
        STATUS_CODE: HttpStatus.INTERNAL_SERVER_ERROR
      }
    }
  }

  async getInsight(username: string): Promise<ResponseProps> {
    const lastSevenDays = new Date();
    lastSevenDays.setDate(lastSevenDays.getDate() - 7);
    const since = lastSevenDays.toISOString().slice(0, 10);

    const weatherLogs = (await this.weatherModel.aggregate([
      { $sort: { "createdAt": -1 } },
      { $limit: 100 },

      {
        $group: {
          _id: "$date",
          latestDocument: { $first: "$$ROOT" },
          allDailyInfo: {
            $push: {
              $cond: [
                { $ifNull: ["$dailyInfo", false] },
                "$dailyInfo",
                "$$REMOVE"
              ]
            }
          },
          temperatures: { $push: "$temperature" }
        }
      },

      { $sort: { _id: -1 } },
      {
        $facet: {
          main: [
            { $limit: 1 }
          ],
          lastWeek: [
            { $match: { _id: { $gte: since } } },
            { $project: { _id: 0, date: "$_id", temperatures: "$temperatures" } },
            { $sort: { date: -1 } },
            { $limit: 7 }
            // se quiser exatamente 7 dias: adicionar aqui { $limit: 7 }
          ]
        }
      },
      {
        $project: {
          item: { $arrayElemAt: ["$main", 0] },
          lastWeek: "$lastWeek"
        }
      },
      {
        $replaceRoot: {
          newRoot: { $mergeObjects: ["$item", { lastWeek: "$lastWeek" }] }
        }
      },
      {
        $project: {
          cityName: "$latestDocument.cityName",
          temperature: "$latestDocument.temperature",
          humidity: "$latestDocument.humidity",
          windSpeed: "$latestDocument.windSpeed",
          cloudCover: "$latestDocument.cloudCover",
          precipitation: "$latestDocument.precipitation",
          time: "$latestDocument.time",
          date: "$latestDocument.date",
          apparentTemperature: "$latestDocument.apparentTemperature",
          rain: "$latestDocument.rain",
          isDay: "$latestDocument.isDay",
          dailyInfo: {
            $ifNull: [
              "$latestDocument.dailyInfo",
              { $arrayElemAt: ["$allDailyInfo", 0] }
            ]
          },
          lastWeek: 1
        }
      }

    ]));
    weatherLogs[0].username = username
    const res = await this.iaService.getInsight(weatherLogs);

    if (res.success) {
      return { message: JSON.parse(res.message as string), STATUS_CODE: 200, success: true };
    }

    return { message: res.message, STATUS_CODE: 200, success: true };
  }
}