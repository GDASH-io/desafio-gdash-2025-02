import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type WeatherLogsDocument = HydratedDocument<WeatherLogs>;

@Schema({
  timestamps: true,
  collection: 'weather_logs',
})
export class WeatherLogs {

  @Prop({ required: true })
  temperatura: number;

  @Prop({ required: true })
  umidade: number;

  @Prop({ required: true })
  vento: number;

  @Prop({ required: true })
  condicao: string;

  @Prop({ required: true })
  probabilidade_chuva: number;

  @Prop({ required: true })
  data_coleta: string;
}

export const WeatherLogsSchema = SchemaFactory.createForClass(
  WeatherLogs,
) as MongooseSchema;
