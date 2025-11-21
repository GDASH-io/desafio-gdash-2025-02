import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../domain/entities/user.entity';
import { UserRepositoryImpl } from '../../infra/database/repositories/user.repository.impl';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { LoginUseCase } from '../../application/usecases/auth/login.use-case';
import { RegisterUseCase } from '../../application/usecases/auth/register.use-case';
import { JwtStrategy } from '../../infra/auth/jwt.strategy';
import { AuthController } from '../../presentation/controllers/auth.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'changeme',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '3600s' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: UserRepositoryImpl,
    },
    JwtStrategy,
    LoginUseCase,
    RegisterUseCase,
  ],
  exports: ['IUserRepository', JwtModule],
})
export class AuthModule {}

