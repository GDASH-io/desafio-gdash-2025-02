import * as mongoose from 'mongoose';
import { Insight } from 'src/types';

const TupleSchema = new mongoose.Schema(
  {
    value: { type: Number, required: true },
    unit: { type: String, required: true },
  },
  { _id: false },
);

export type WeatherDataItem = {
  date: string;
  hour: string;
  interval: { value: number; unit: string };
  temperature_2m: { value: number; unit: string };
  relative_humidity_2m: { value: number; unit: string };
  precipitation_probability: { value: number; unit: string };
  precipitation: { value: number; unit: string };
  rain: { value: number; unit: string };
  weather_code: { value: number; unit: string };
  pressure_msl: { value: number; unit: string };
  cloud_cover: { value: number; unit: string };
  visibility: { value: number; unit: string };
  evapotranspiration: { value: number; unit: string };
  et0_fao_evapotranspiration: { value: number; unit: string };
  wind_speed_10m: { value: number; unit: string };
  wind_speed_80m: { value: number; unit: string };
  wind_speed_120m: { value: number; unit: string };
  wind_direction_10m: { value: number; unit: string };
  wind_direction_80m: { value: number; unit: string };
  wind_direction_120m: { value: number; unit: string };
  wind_speed_180m: { value: number; unit: string };
  wind_direction_180m: { value: number; unit: string };
  wind_gusts_10m: { value: number; unit: string };
  temperature_80m: { value: number; unit: string };
  temperature_120m: { value: number; unit: string };
  temperature_180m: { value: number; unit: string };
  is_day: { value: number; unit: string };
  uv_index: { value: number; unit: string };
  uv_index_clear_sky: { value: number; unit: string };
  direct_radiation: { value: number; unit: string };
};

export type WeatherDocument = {
  _id?: mongoose.Types.ObjectId;
  date: string;
  data: WeatherDataItem[];
  insight?: Insight;
  embedding?: number[];
  createdAt?: Date;
  updatedAt?: Date;
};

export const WeatherSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    data: {
      type: [
        {
          date: { type: String, required: true },
          hour: { type: String, required: true },
          interval: { type: TupleSchema, required: true },
          temperature_2m: { type: TupleSchema, required: true },
          relative_humidity_2m: { type: TupleSchema, required: true },
          precipitation_probability: { type: TupleSchema, required: true },
          precipitation: { type: TupleSchema, required: true },
          rain: { type: TupleSchema, required: true },
          weather_code: { type: TupleSchema, required: true },
          pressure_msl: { type: TupleSchema, required: true },
          cloud_cover: { type: TupleSchema, required: true },
          visibility: { type: TupleSchema, required: true },
          evapotranspiration: { type: TupleSchema, required: true },
          et0_fao_evapotranspiration: { type: TupleSchema, required: true },
          wind_speed_10m: { type: TupleSchema, required: true },
          wind_speed_80m: { type: TupleSchema, required: true },
          wind_speed_120m: { type: TupleSchema, required: true },
          wind_direction_10m: { type: TupleSchema, required: true },
          wind_direction_80m: { type: TupleSchema, required: true },
          wind_direction_120m: { type: TupleSchema, required: true },
          wind_speed_180m: { type: TupleSchema, required: true },
          wind_direction_180m: { type: TupleSchema, required: true },
          wind_gusts_10m: { type: TupleSchema, required: true },
          temperature_80m: { type: TupleSchema, required: true },
          temperature_120m: { type: TupleSchema, required: true },
          temperature_180m: { type: TupleSchema, required: true },
          is_day: { type: TupleSchema, required: true },
          uv_index: { type: TupleSchema, required: true },
          uv_index_clear_sky: { type: TupleSchema, required: true },
          direct_radiation: { type: TupleSchema, required: true },
        },
      ],
      required: true,
    },
    insight: {
      type: {
        description: { type: String, required: true },
        activities: { type: [String], required: true },
      },
      required: false,
    },
    embedding: {
      type: [Number],
      required: false,
    },
  },
  {
    timestamps: true,
  },
);
