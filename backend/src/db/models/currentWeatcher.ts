import { model, models, Schema } from "mongoose";

export interface ICurrentWeather {
  time: Date;
  temperature2m: number;
  relativeHumidity2m: number;
  apparentTemperature: number;
  isDay: boolean;
  precipitation: number;
  weatherCode: number;
  cloudCover: number;
  windSpeed10m: number;
  windDirection10m: number;
  windGusts10m: number;
}

const CurrentWeatherSchema = new Schema<ICurrentWeather>({
  time: { type: Date, required: true, unique: true },
  temperature2m: { type: Number, required: true },
  relativeHumidity2m: { type: Number, required: true },
  apparentTemperature: { type: Number, required: true },
  isDay: { type: Boolean, required: true },
  precipitation: { type: Number, required: true },
  weatherCode: { type: Number, required: true },
  cloudCover: { type: Number, required: true },
  windSpeed10m: { type: Number, required: true },
  windDirection10m: { type: Number, required: true },
  windGusts10m: { type: Number, required: true },
});

export const CurrentWeather = models.CurrentWeather || model<ICurrentWeather>("CurrentWeather", CurrentWeatherSchema);

export async function insertCurrentWeather(data: ICurrentWeather): Promise<ICurrentWeather> {
  try {
    const newRecord = await CurrentWeather.create(data);
    return newRecord;
  } catch (error) {
    throw new Error(`insertCurrentWeather error ${error}`);
  }
}

export async function updateCurrentWeatherByTime(data: ICurrentWeather): Promise<ICurrentWeather | null> {
  try {
    const updatedRecord = await CurrentWeather.findOneAndUpdate(
      { time: data.time },
      data,
      { new: true }
    );

    if (!updatedRecord) {
      console.warn(`warn: ${data.time}`);
    }

    return updatedRecord;
  } catch (error) {
    throw new Error(`updateCurrentWeatherByTime error ${error}`);
  }
}

export async function deleteAllCurrentWeather(): Promise<void> {
  try {
    await CurrentWeather.deleteMany();
  } catch (error) {
    throw new Error(`deleteAllCurrentWeather error ${error}`);
  }
}

export async function upsertCurrentWeather(data: ICurrentWeather): Promise<ICurrentWeather> {
  try {
    const result = await CurrentWeather.findOneAndUpdate(
      { time: data.time },
      data,
      { new: true, upsert: true }
    );
    return result as ICurrentWeather;
  } catch (error) {
    throw new Error(`upsertCurrentWeather error ${error}`);
  }
}

export async function getAllCurrentWeather(): Promise<ICurrentWeather[]> {
  try {
    const records = await CurrentWeather.find();
    return records;
  } catch (error) {
    throw new Error(`getAllCurrentWeather error ${error}`);
  }
}

export async function getLatestCurrentWeather(): Promise<ICurrentWeather | null> {
  try {
    const latestWeather = await CurrentWeather.findOne()
      .sort({ time: -1 });

    return latestWeather;
  } catch (error) {
    throw new Error(`getLatestCurrentWeather error ${error}`);
  }
}