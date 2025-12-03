import { Schema, Document } from 'mongoose';

export interface WeatherData extends Document {
	timestamp: Date;
	latitude: number;
	longitude: number;
	temperature: number;
	wind_speed: number;
	weather_code: number;
	insight?: string;
}

export const WeatherDataSchema = new Schema<WeatherData>({
	timestamp: { type: Date, default: Date.now, required: true, index: true },
	latitude: { type: Number, required: true },
	longitude: { type: Number, required: true },
	temperature: { type: Number, required: true },
	wind_speed: { type: Number, required: true },
	weather_code: { type: Number, required: true },
	insight: { type: String, required: false },
});
