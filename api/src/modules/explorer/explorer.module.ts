import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  commonConstants,
  envVariables,
  publicUrlConfigConstants,
} from 'src/shared/constants';
import { ExplorerController } from './explorer.controller';
import { ExplorerService } from './explorer.service';
import { ExplorerAdapter } from './infraestructure/adapters/explorer.adapter';

@Module({
  controllers: [ExplorerController],
  providers: [
    ExplorerService,
    {
      provide: commonConstants.ports.EXPLORER,
      useFactory: (config: ConfigService) => {
        const BASE_URL = config.getOrThrow<string>(envVariables.PUBLIC_API_URL);
        const LIMIT = publicUrlConfigConstants.LIMIT;
        return new ExplorerAdapter(BASE_URL, LIMIT);
      },
      inject: [ConfigService],
    },
  ],
})
export class ExplorerModule {}
