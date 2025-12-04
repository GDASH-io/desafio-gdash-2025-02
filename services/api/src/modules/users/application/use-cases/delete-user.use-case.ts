import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { UserRepository } from "../../infrastructure/repositories/user.repository";

@Injectable()
export class DeleteUserUseCase {
    private readonly logger = new Logger(DeleteUserUseCase.name);

    constructor(private readonly userRepository: UserRepository) {}

    async execute(id: string): Promise<void> {
        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        await this.userRepository.delete(id);

        this.logger.log(`User deleted: ${user.email}`);
    }
}