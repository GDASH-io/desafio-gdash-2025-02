import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; 
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule, 
    PassportModule,
    JwtModule.register({
      global: true, //TORNA DISPÓNIVEL GLOBAL
      secret: '4a3aa4aeb3ba5e2f74933a5b106ca6c3', //chave https://www.md5hashgenerator.com/
      signOptions: { expiresIn: '60m' },//TEMPO DE DURAÇÃO DO TOKEN
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
