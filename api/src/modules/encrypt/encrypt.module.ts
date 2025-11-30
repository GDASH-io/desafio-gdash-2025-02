import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { commonConstants } from 'src/shared/constants';
import { EncryptService } from './encrypt.service';
import { EncryptAdapter } from './infraestructure/adapters/encrypt.adapter';

@Module({
  imports: [
    JwtModule.register({
      signOptions: { expiresIn: '2h', algorithm: 'HS256' },
    }),
  ],
  providers: [
    EncryptService,
    {
      provide: commonConstants.ports.ENCRYPT,
      useFactory: (jwtService: JwtService, config: ConfigService) => {
        return new EncryptAdapter(jwtService, config);
      },
      inject: [JwtService, ConfigService],
    },
  ],
  exports: [EncryptService],
})
export class EncryptModule {}
