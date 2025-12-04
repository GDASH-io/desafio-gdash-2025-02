import { UserRepository } from "@/modules/users/infrastructure/repositories/user.repository";
import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { HashService } from "../../infrastructure/services/hash.service";
import { JwtService } from "@nestjs/jwt";
import { AuthResponseDto, LoginDto } from "../dto/auth.dto";

@Injectable()
export class LoginUseCase {
    private readonly logger = new Logger(LoginUseCase.name);

    constructor(
        private readonly userRepository: UserRepository,
        private readonly hashService: HashService,
        private readonly jwtService: JwtService,
    ) {}

    async execute(loginDto: LoginDto): Promise<AuthResponseDto> {
        const { email, password } = loginDto;

        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            this.logger.warn(`Login attempt with invalid email: ${email}`);
            throw new UnauthorizedException('Credenciais inválidas');
        }

        if (!user.isActive) {
            this.logger.warn(`Login attempt with inactive user: ${email}`);
            throw new UnauthorizedException('Usuário inativo');
        }

        const isPasswordValid = await this.hashService.compare(password, user.password);

        if (!isPasswordValid) {
            this.logger.warn(`Login attempt with invalid password for user: ${email}`);
            throw new UnauthorizedException('Credenciais inválidas');
        }

        await this.userRepository.updateLastLogin(user._id.toString());

        const payload = {
            sub: user._id.toString(),
            email: user.email,
            roles: user.roles,
        };

        const accessToken = this.jwtService.sign(payload);

        this.logger.log(`User logged: ${email}`);

        return {
            accessToken,
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                roles: user.roles
            },
        };
    }
}