import { Schema } from 'mongoose';

export const WeatherSchema = new Schema({
  timestamp: String,
  temperature: Number,
  windspeed: Number,
  humidity: Number,
  latitude: String,
  longitude: String,
  condition: String
});
