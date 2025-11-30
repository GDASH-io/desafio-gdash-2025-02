import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type WeatherDocument = HydratedDocument<Weather>;

@Schema({ timestamps: true }) // Adiciona created_at automático
export class Weather {
  @ApiProperty({ example: '6560e...' })
  _id: string;

  @ApiProperty({ example: -23.55 })
  @Prop({ required: true })
  location_lat: number;

  @ApiProperty({ example: -46.63 })
  @Prop({ required: true })
  location_lon: number;

  @ApiProperty({ example: 25.0 })
  @Prop({ required: true })
  temperature: number;

  @ApiProperty({ example: 60 })
  @Prop()
  humidity: number;

  @ApiProperty({ example: 10 })
  @Prop()
  wind_speed: number;

  @ApiProperty({ example: 1 })
  @Prop()
  condition_code: number;

  @ApiProperty({ example: '2025-11-24T...' })
  @Prop()
  collected_at: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export const WeatherSchema = SchemaFactory.createForClass(Weather);
