import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserSchema } from './schemas/user.schema';

const SECRET = process.env.JWT_SECRET || 'SUPER_SECRET_KEY_CLIMATEMPO_NEVER_USE_HARDCODED_SECRET_IN_PROD';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    JwtModule.register({ secret: SECRET, signOptions: { expiresIn: '60m' } }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}