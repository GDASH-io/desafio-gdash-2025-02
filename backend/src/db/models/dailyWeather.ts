import { model, models, Schema } from "mongoose"

export interface IDailyWeather {
  time: Date,
  weatherCode: number,
  temperature2mMax: number,
  temperature2mMin: number,
  temperature2mMean: number,
  apparentTemperatureMax: number,
  apparentTemperatureMin: number,
  sunrise: Date,
  sunset: Date,
  uvIndexMax: number,
  precipitationSum: number,
  precipitationHours: number,
  precipitationProbabilityMax: number,
  windGusts10mMax: number,
  sunshineDuration: number,
  relativeHumidity2mMax: number,
  cloudCoverMean: number,
  capeMax: number,
}

const DailyWeatherSchema = new Schema({
  time: { type: Date, required: true, unique: true },
  weatherCode: { type: Number, required: true },
  temperature2mMax: { type: Number, required: true },
  temperature2mMin: { type: Number, required: true },
  temperature2mMean: { type: Number, required: true },
  apparentTemperatureMax: { type: Number, required: true },
  apparentTemperatureMin: { type: Number, required: true },
  sunrise: { type: Date, required: true },
  sunset: { type: Date, required: true },
  uvIndexMax: { type: Number, required: true },
  precipitationSum: { type: Number, required: true },
  precipitationHours: { type: Number, required: true },
  precipitationProbabilityMax: { type: Number, required: true },
  windGusts10mMax: { type: Number, required: true },
  sunshineDuration: { type: Number, required: true },
  relativeHumidity2mMax: { type: Number, required: true },
  cloudCoverMean: { type: Number, required: true },
  capeMax: { type: Number, required: true },
})

export const DailyWeather = models.DailyWeather || model("DailyWeather", DailyWeatherSchema)

export async function insertDailyWeather(data: IDailyWeather): Promise<IDailyWeather> {
  try {
    const newWeather = await DailyWeather.create(data);
    return newWeather;
  } catch (error) {
    throw new Error(`insertDailyWeather error ${error}`);
  }
}

export async function updateDailyWeatherByTime(data: IDailyWeather): Promise<IDailyWeather | null> {
  try {
    const updatedWeather = await DailyWeather.findOneAndUpdate(
      { time: data.time },
      data,
      { new: true }
    );

    if (!updatedWeather) {
      console.warn(`warn: ${data.time}`);
      return null;
    }

    return updatedWeather;
  } catch (error) {
    throw new Error(`updateDailyWeatherByTime error ${error}`);
  }
}

export async function upsertDailyWeather(data: IDailyWeather): Promise<IDailyWeather> {
  try {
    const result = await DailyWeather.findOneAndUpdate(
      { time: data.time },
      data,
      { new: true, upsert: true }
    );
    return result as IDailyWeather;
  } catch (error) {
    throw new Error(`upsertDailyWeather error ${error}`);
  }
}

export async function getDailyWeatherAll(): Promise<IDailyWeather[]> {
  try {
    const records = await DailyWeather.find();
    return records;
  } catch (error) {
    throw new Error(`getDailyWeatherAll error ${error}`);
  }
}

export async function getDailyWeatherByDay(timestamp: number): Promise<IDailyWeather | null> {
  try {
    const date = new Date(timestamp);
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const dailyWeather = await DailyWeather.findOne({
      time: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    return dailyWeather;
  } catch (error) {
    throw new Error(`getDailyWeatherByDate error ${error}`);
  }
}

export async function getUpcomingDailyWeather(startDate: number, limit: number): Promise<IDailyWeather[]> {
  try {
    const weatherData = await DailyWeather.find({
      time: { $gte: new Date(startDate) }
    })
      .sort({ time: 1 })
      .limit(limit);
    return weatherData;
  } catch (error) {
    throw new Error(`getUpcomingDailyWeather error ${error}`);
  }
}