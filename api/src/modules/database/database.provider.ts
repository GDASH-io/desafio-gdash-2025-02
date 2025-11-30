import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mongoose from 'mongoose';
import { envVariables, mongoDBConstants } from 'src/shared/constants';

export const databaseProviders: Provider[] = [
  {
    provide: mongoDBConstants.DATABASE_CONNECTION,
    useFactory: (config: ConfigService): Promise<typeof mongoose> =>
      mongoose.connect(config.getOrThrow<string>(envVariables.MONGO_URI)),
    inject: [ConfigService],
  },
];
