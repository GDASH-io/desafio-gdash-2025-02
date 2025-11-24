// src/weather/schema/weather.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type WeatherDocument = Weather & Document

@Schema({ timestamps: true })
export class Weather {
  @Prop({ type: Object })
  data: {
    temperature?: number
    humidity?: number
    windSpeed?: number
    wind_speed?: number // ✅ ADICIONE ESTA LINHA
    description?: string
    weatherCondition?: string // ✅ ADICIONE ESTA LINHA
    weatherCode?: number // ✅ ADICIONE ESTA LINHA TAMBÉM
    pressure?: number
    visibility?: number
  }

  @Prop({ type: Object })
  location: {
    city?: string
    country?: string
    state?: string // ✅ ADICIONE ESTA LINHA
    latitude?: number // ✅ ADICIONE ESTA LINHA
    longitude?: number // ✅ ADICIONE ESTA LINHA
    lat?: number
    lon?: number
  }

  @Prop()
  source: string

  @Prop()
  timestamp: string

  @Prop()
  version: string

  @Prop()
  createdAt?: Date

  @Prop()
  updatedAt?: Date
}

export const WeatherSchema = SchemaFactory.createForClass(Weather)
