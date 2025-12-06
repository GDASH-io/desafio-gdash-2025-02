import { model, models, Schema } from "mongoose"

export interface IHourlyWeather {
  time: Date,
  temperature2m: number,
  relativeHumidity2m: number,
  apparentTemperature: number,
  precipitationProbability: number,
  precipitation: number,
  weatherCode: number,
  cloudCover: number,
  windSpeed10m: number,
  windGusts10m: number,
  visibility: number,
}

const HourlyWeatherSchema = new Schema<IHourlyWeather>({
  time: { type: Date, required: true, unique: true },
  temperature2m: { type: Number, required: true },
  relativeHumidity2m: { type: Number, required: true },
  apparentTemperature: { type: Number, required: true },
  precipitationProbability: { type: Number, required: true },
  precipitation: { type: Number, required: true },
  weatherCode: { type: Number, required: true },
  cloudCover: { type: Number, required: true },
  windSpeed10m: { type: Number, required: true },
  windGusts10m: { type: Number, required: true },
  visibility: { type: Number, required: true },
})

export const HourlyWeather = models.HourlyWeather || model<IHourlyWeather>("HourlyWeather", HourlyWeatherSchema)

export async function insertHourlyWeather(data: IHourlyWeather): Promise<IHourlyWeather> {
  try {
    const newRecord = await HourlyWeather.create(data);
    return newRecord;
  } catch (error) {
    throw new Error(`insertHourlyWeather error ${error}`);
  }
}

export async function updateHourlyWeatherByTime(data: IHourlyWeather): Promise<IHourlyWeather | null> {
  try {
    const updatedRecord = await HourlyWeather.findOneAndUpdate(
      { time: data.time },
      data,
      { new: true }
    );

    if (!updatedRecord) {
      console.warn(`warn: ${data.time}`);
    }

    return updatedRecord;
  } catch (error) {
    throw new Error(`updateHourlyWeatherByTime error ${error}`);
  }
}

export async function upsertHourlyWeather(data: IHourlyWeather): Promise<IHourlyWeather> {
  try {
    const result = await HourlyWeather.findOneAndUpdate(
      { time: data.time },
      data,
      { new: true, upsert: true }
    );
    return result as IHourlyWeather;
  } catch (error) {
    throw new Error(`upsertHourlyWeather error ${error}`);
  }
}

export async function getAllHourlyWeather(): Promise<IHourlyWeather[]> {
  try {
    const records = await HourlyWeather.find()
    return records;
  } catch (error) {
    throw new Error(`getAllHourlyWeather error ${error}`);
  }
}

export async function getUpcomingHourlyWeather(startDate: number, limit: number): Promise<IHourlyWeather[]> {
  try {
    const weatherData = await HourlyWeather.find({
      time: { $gte: new Date(startDate) }
    })
      .sort({ time: 1 })
      .limit(limit);
    return weatherData;
  } catch (error) {
    throw new Error(`getUpcomingHourlyWeather error ${error}`);
  }
}