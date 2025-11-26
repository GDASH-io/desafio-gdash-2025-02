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

    @Prop()
    cidade: string;

    @Prop()
    pais: string;

    @Prop()
    temp_max: number;

    @Prop()
    temp_min: number;

    @Prop()
    velocidade_vento: number;

    @Prop()
    condicao_ceu: number;

    @Prop()
    probabilidade_chuva: number;
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);
