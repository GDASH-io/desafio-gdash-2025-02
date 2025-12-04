import { UserRepository } from "@/modules/users/infrastructure/repositories/user.repository";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private userRepository: UserRepository,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: String(configService.get<string>('jwt.secret'))
        });
    }

    async validate(payload: any) {
        const user = await this.userRepository.findById(payload.sub);

        if (!user || !user.isActive) {
            throw new UnauthorizedException('Usuário não encontrado ou inativo');
        }

        return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            roles: user.roles,
        };
    }
}