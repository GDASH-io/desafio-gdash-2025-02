import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users.module';
import { AuthModule } from './modules/auth.module';


@Module({
  imports: [
    ConfigModule.forRoot({
 isGlobal: true,
}),
  MongooseModule.forRoot(process.env.MONGO_URL ?? ''),
  UsersModule,
  AuthModule,
  ]
})
export class AppModule {}
