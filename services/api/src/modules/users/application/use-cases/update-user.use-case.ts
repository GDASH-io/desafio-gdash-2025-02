import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import { HashService } from "@/modules/auth/infrastructure/services/hash.service";
import { UpdateUserDto } from "../dto/user.dto";
import { UserDocument } from "../../infrastructure/schemas/user.schema";

@Injectable()
export class UpdateUserUseCase {
    private readonly logger = new Logger(UpdateUserUseCase.name);

    constructor(
        private readonly userRepository: UserRepository,
        private readonly hashService: HashService,
    ) {}

    async execute(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument | null> {
        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        if (updateUserDto.password) {
            updateUserDto.password = await this.hashService.hash(updateUserDto.password);
        }

        const updatedUser = await this.userRepository.update(id, updateUserDto);

        this.logger.log(`User updated: ${updatedUser?.email}`)

        return updatedUser
    }
}