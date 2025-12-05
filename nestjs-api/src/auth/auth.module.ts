import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';

const SECRET = process.env.JWT_SECRET || 'SUPER_SECRET_KEY_CLIMATEMPO_NEVER_USE_HARDCODED_SECRET_IN_PROD';

@Module({
	imports: [
		UsersModule,
		JwtModule.register({ secret: SECRET, signOptions: { expiresIn: '60m' } }),
	],
	controllers: [AuthController],
})
export class AuthModule {}
