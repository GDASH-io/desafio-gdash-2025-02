import { Connection } from 'mongoose';
import { mongoDBConstants } from 'src/shared/constants';
import { UserSchema } from './user.schema';

export const userProviders = [
  {
    provide: mongoDBConstants.models.USER_MODEL,
    useFactory: (connection: Connection) =>
      connection.model(
        mongoDBConstants.collections.USER_COLLECTION,
        UserSchema,
      ),
    inject: [mongoDBConstants.DATABASE_CONNECTION],
  },
];
