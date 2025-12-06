import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type WeatherLogDocument = HydratedDocument<WeatherLogSchema>;

@Schema({ collection: "weather_logs", timestamps: true })
export class WeatherLogSchema {
  @Prop({ required: true, type: Number })
  temperature: number;

  @Prop({ required: true, type: Number, min: 0, max: 100 })
  humidity: number;

  @Prop({ required: true, type: Number, min: 0 })
  windSpeed: number;

  @Prop({ required: true, type: String })
  skyCondition: string;

  @Prop({ required: true, type: Number, min: 0, max: 100 })
  rainProbability: number;

  @Prop({ required: true, type: String, index: true })
  location: string;

  @Prop({ required: true, type: Date, index: true })
  collectedAt: Date;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export const WeatherLogMongoSchema =
  SchemaFactory.createForClass(WeatherLogSchema);

WeatherLogMongoSchema.index({ location: 1, collectedAt: -1 });
WeatherLogMongoSchema.index({ collectedAt: -1 });
