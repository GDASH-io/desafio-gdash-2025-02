import { UserRepository } from "@/modules/users/infrastructure/repositories/user.repository";
import { ConflictException, Injectable, Logger } from "@nestjs/common";
import { HashService } from "../../infrastructure/services/hash.service";
import { JwtService } from "@nestjs/jwt";
import { AuthResponseDto, RegisterDto } from "../dto/auth.dto";

@Injectable()
export class RegisterUseCase {
    private readonly logger = new Logger(RegisterUseCase.name);

    constructor(
        private readonly userRepository: UserRepository,
        private readonly hashService: HashService,
        private readonly jwtService: JwtService,
    ) {}

    async execute(registerDto: RegisterDto): Promise<AuthResponseDto> {
        const { email, password, name } = registerDto;

        const existingUser = await this.userRepository.findByEmail(email);

        if (existingUser) {
            this.logger.warn('User already exists');
            throw new ConflictException('Email já cadastrado');
        }

        const hashedPassword = await this.hashService.hash(password);

        const user = await this.userRepository.create({
            email,
            password: hashedPassword,
            name,
            roles: ['user'],
        });

        const payload = {
            sub: user._id.toString(),
            email: user.email,
            roles: user.roles,
        };

        const accessToken = this.jwtService.sign(payload);

        this.logger.log('User registered successfully');

        return {
            accessToken,
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                roles: user.roles,
            },
        };
    }
}