import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ timestamps: true, collection: 'weather_logs' })
export class WeatherLog extends Document {
  @Prop({ required: true })
  temperature: number

  @Prop({ required: true })
  humidity: number

  @Prop({ required: true })
  windSpeed: number

  @Prop({ required: true })
  condition: string

  @Prop({ required: true })
  rainProbability: number

  @Prop({ required: true })
  location: string

  @Prop({ required: true })
  latitude: number

  @Prop({ required: true })
  longitude: number

  @Prop({ required: true })
  collectedAt: Date

  createdAt: Date
  updatedAt: Date
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog)
