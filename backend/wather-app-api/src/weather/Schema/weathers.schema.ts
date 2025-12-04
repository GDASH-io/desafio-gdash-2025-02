import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument } from "mongoose";

export type WeatherDocument = HydratedDocument<Weather>;

@Schema({timestamps: true})
export class Weather extends Document{
    @Prop({required: true})
    cityName: string;

    @Prop({required: true})
    tempture: number;

    @Prop({required: true})
    rain: number;

    @Prop({required: true})
    humidity: number;

    @Prop({required: true})
    sun: number;

    @Prop({required: true})
    allTemp: string;

    @Prop({required: true})
    cloud: number
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);
