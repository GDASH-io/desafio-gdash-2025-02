import { Connection } from 'mongoose';
import { mongoDBConstants } from 'src/shared/constants';
import { WeatherSchema } from './weather.schema';

export const weatherProviders = [
  {
    provide: mongoDBConstants.models.WEATHER_MODEL,
    useFactory: (connection: Connection) =>
      connection.model(
        mongoDBConstants.collections.WEATHER_COLLECTION,
        WeatherSchema,
      ),
    inject: [mongoDBConstants.DATABASE_CONNECTION],
  },
];
