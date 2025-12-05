import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "../auth/services/auth.service";
import { AuthController } from "../auth/controllers/auth.controller";
import { JwtStrategy } from "../auth/strategies/jwt.strategy";
import { UsersModule } from "./users.module";

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? "defaultsecret",
      signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN as any) ?? "1d" },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
