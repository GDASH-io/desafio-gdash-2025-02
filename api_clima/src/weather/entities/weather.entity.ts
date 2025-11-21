import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';


export type WeatherDocument = HydratedDocument<Weather>;

@Schema({ timestamps: true })
export class Weather {
    @Prop()
    latitude: number;

    @Prop()
    longitude: number;

    @Prop({ required: true })
    temperatura: number;

    @Prop()
    umidade: number;

    @Prop()
    chuva: number;

    @Prop()
    eh_dia: boolean;

    @Prop()
    coleta_timestamp: string;
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);
