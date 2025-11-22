import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'weather_logs' })
export class WeatherLog extends Document {
	@Prop({ required: true })
	timestamp!: Date; // instante da observação (hora)

	@Prop({
		type: {
			latitude: { type: Number, required: true },
			longitude: { type: Number, required: true },
			geohash: { type: String, required: false }
		},
		required: true
	})
	location!: { latitude: number; longitude: number; geohash?: string };

	@Prop({ required: true })
	temperature2m!: number; // °C
	@Prop({ required: true })
	relativeHumidity2m!: number; // %
	@Prop({ required: true })
	pressureMsl!: number; // hPa
	@Prop({ required: true })
	windSpeed10m!: number; // km/h
	@Prop({ required: true })
	windDirection10m!: number; // graus
	@Prop({ required: false })
	windGusts10m?: number; // km/h
	@Prop({ required: true })
	precipitation!: number; // mm
	@Prop({ required: false })
	precipitationProbability?: number; // %
	@Prop({ required: true })
	cloudcover!: number; // %
	@Prop({ required: true })
	weatherCode!: number; // WMO code

	@Prop({ required: true, default: 'open-meteo' })
	source!: string;

	@Prop({
		type: {
			temperature2m: { type: String },
			windSpeed10m: { type: String },
			pressureMsl: { type: String },
			precipitation: { type: String },
			cloudcover: { type: String },
			relativeHumidity2m: { type: String }
		},
		required: true
	})
	units!: {
		temperature2m: string;
		windSpeed10m: string;
		pressureMsl: string;
		precipitation: string;
		cloudcover: string;
		relativeHumidity2m: string;
	};

	@Prop({ required: true })
	fetchedAt!: Date; // quando foi buscado da API

	createdAt!: Date;
	updatedAt!: Date;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);

// Índice único para evitar duplicados (mesma hora e local)
WeatherLogSchema.index(
	{ 'location.latitude': 1, 'location.longitude': 1, timestamp: 1 },
	{ unique: true }
);

// Index para consultas por intervalo temporal isolado
WeatherLogSchema.index({ timestamp: 1 });
