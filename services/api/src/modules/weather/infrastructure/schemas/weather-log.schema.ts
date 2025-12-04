import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Expose, Transform } from "class-transformer";
import mongoose, { Document } from "mongoose";

export type WeatherLogDocument = WeatherLog & Document;

class Location {
    @Prop({ required: true })
    latitude: number;

    @Prop({ required: true })
    longitude: number;

    @Prop({ required: true, trim: true })
    city: string;
}

@Schema({
    timestamps: true,
    collection: 'weather_logs',
})
export class WeatherLog {
    @Prop({ require: true, type: Date })
    timestamp: Date;

    @Prop({ required: true, type: Location })
    location: Location;

    @Prop({ required: true })
    temperature: number;

    @Prop({ required: true })
    apparentTemperature: number

    @Prop({ required: true, min: 0, max: 100 })
    humidity: number;

    @Prop({ required: true })
    pressure: number

    @Prop({ required: true, min: 0 })
    windSpeed: number

    @Prop({ required: true, min: 0 })
    precipitation: number

    @Prop({ required: true, min: 0, max: 100 })
    cloudCover: number

    @Prop({ required: true })
    weatherCode: number

    @Prop()
    createdAt?: Date
    
    @Prop()
    updatedAt?: Date
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);

WeatherLogSchema.index({ timestamp: -1 });
WeatherLogSchema.index({ 'location.city': 1 });
WeatherLogSchema.index({ 'location.city': 1, timestamp: -1 });
WeatherLogSchema.index({ createdAt: -1 });

WeatherLogSchema.set('toJSON', {
    transform: (doc, ret: Partial<WeatherLog> & { _id?: mongoose.Types.ObjectId; __v?: number; id?: string}) => {
        if (ret._id) ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});