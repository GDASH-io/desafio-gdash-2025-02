import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"

export type WeatherDocument = Weather & Document

class DailyInfo {
  @Prop({required: true})
  days: string[];

  @Prop({required: true})
  tempMin: number[];

  @Prop({required: true})
  tempMax: number[];

  @Prop({required: true})
  uvIndex: number[];

  @Prop({required: true})
  solarRadiation: number[]
}

@Schema({ timestamps: true, collection: "weather_logs" })
export class Weather extends Document {

  @Prop({ required: true })
  cityName: string;

  @Prop({ required: true })
  temperature: number;

  @Prop({ required: true })
  humidity: number;

  @Prop({ required: true })
  windSpeed: number;

  @Prop({ required: true })
  cloudCover: number;

  @Prop({ required: true })
  precipitation: number;

  @Prop({ required: true })
  time: string

  @Prop({required: true})
  date: string

  @Prop({ required: true })
  apparentTemperature: number

  @Prop({ required: true })
  rain: number

  @Prop({ required: true })
  isDay: number

  @Prop({ required: false, type:DailyInfo })
  dailyInfo: DailyInfo
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);