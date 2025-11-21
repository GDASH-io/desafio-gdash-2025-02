import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './entities/user.entity';
import { JwtStrategy } from '../auth/jwt.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy],
  exports: [UsersService],
})
export class UsersModule {}