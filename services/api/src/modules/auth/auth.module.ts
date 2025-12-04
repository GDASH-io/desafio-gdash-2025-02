import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./presentation/auth.controller";
import { LoginUseCase } from "./application/use-cases/login.use-case";
import { RegisterUseCase } from "./application/use-cases/register.use-case";
import { HashService } from "./infrastructure/services/hash.service";
import { JwtStrategy } from "./infrastructure/strategies/jwt.strategy";
import { UsersModule } from "../users/users.module";

@Module({
    imports: [
        UsersModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('jwt.secret'),
                signOptions: {
                    expiresIn: configService.get<number>('jwt.expiresIn'),
                },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [
        LoginUseCase,
        RegisterUseCase,
        HashService,
        JwtStrategy,
    ],
    exports: [HashService, JwtModule],
})
export class AuthModule {}