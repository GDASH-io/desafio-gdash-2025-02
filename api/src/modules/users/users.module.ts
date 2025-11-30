import { Module } from '@nestjs/common';
import { commonConstants } from 'src/shared/constants';
import { DatabaseModule } from '../database/database.module';
import { EncryptModule } from '../encrypt/encrypt.module';
import { UserRepository } from './infraestructure/adapters/mongoUser.repository';
import { userProviders } from './infraestructure/schema/user.provider';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [DatabaseModule, EncryptModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    ...userProviders,
    { provide: commonConstants.ports.USERS, useClass: UserRepository },
  ],
  exports: [UsersService, ...userProviders],
})
export class UsersModule {}
