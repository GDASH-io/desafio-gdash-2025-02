import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],

      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') ??
            'SEGREDO_DEFAULT_DE_TESTE_LOCAL', // Use nullish coalescing operator for safer default
        signOptions: { expiresIn: '1d' }, // Token expira em 1 dia
      }),
      inject: [ConfigService],
      global: true, // Torna o JwtService disponível em toda a aplicação (para os Guards)
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
