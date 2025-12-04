import { ConflictException, Injectable, Logger } from "@nestjs/common";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import { HashService } from "@/modules/auth/infrastructure/services/hash.service";
import { CreateUserDto } from "../dto/user.dto";
import { UserDocument } from "../../infrastructure/schemas/user.schema";

@Injectable()
export class CreateUserUseCase {
    private readonly logger = new Logger(CreateUserUseCase.name);

    constructor(
        private readonly userRepository: UserRepository,
        private readonly hashService: HashService,
    ) {}

    async execute(createUserDto: CreateUserDto): Promise<UserDocument> {
        const existingUser = await this.userRepository.findByEmail(createUserDto.email);

        if (existingUser) {
            throw new ConflictException('Email já cadastrado');
        }

        const hashedPassword = await this.hashService.hash(createUserDto.password);

        const user = await this.userRepository.create({
            ...createUserDto,
            password: hashedPassword,
        });

        this.logger.log(`User created: ${user.email}`);

        return user;
    }
}