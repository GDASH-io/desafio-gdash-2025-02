import { Module } from '@nestjs/common';
import { commonConstants } from 'src/shared/constants';
import { EncryptModule } from '../encrypt/encrypt.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './infraestructure/adapters/auth.repository';

@Module({
  imports: [UsersModule, EncryptModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: commonConstants.ports.AUTH,
      useClass: AuthRepository,
    },
  ],
})
export class AuthModule {}
