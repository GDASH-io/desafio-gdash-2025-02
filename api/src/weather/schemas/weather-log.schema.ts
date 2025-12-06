import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WeatherLogDocument = WeatherLog & Document;

@Schema({ timestamps: true })
export class WeatherLog {
  @Prop({ required: true })
  timestamp: string;

  @Prop({
    type: {
      latitude: Number,
      longitude: Number,
      city: String,
    },
    required: true,
  })
  location: {
    latitude: number;
    longitude: number;
    city?: string;
  };

  @Prop({
    type: {
      temperature: Number,
      humidity: Number,
      wind_speed: Number,
      weather_code: Number,
    },
    required: true,
  })
  current: {
    temperature: number;
    humidity: number;
    wind_speed: number;
    weather_code: number;
  };

  @Prop({
    type: {
      hourly: [
        {
          time: String,
          temperature: Number,
          humidity: Number,
          wind_speed: Number,
          precipitation_probability: Number,
          weather_code: Number,
        },
      ],
    },
    default: { hourly: [] },
  })
  forecast: {
    hourly: Array<{
      time: string;
      temperature?: number;
      humidity?: number;
      wind_speed?: number;
      precipitation_probability?: number;
      weather_code?: number;
    }>;
  };
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);

WeatherLogSchema.index({ timestamp: -1 });
WeatherLogSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
