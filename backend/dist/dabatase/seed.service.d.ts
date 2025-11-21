import { OnModuleInit } from '@nestjs/common';
import { UsersService } from '../users/users.service';
export declare class SeedService implements OnModuleInit {
    private usersService;
    private readonly logger;
    constructor(usersService: UsersService);
    onModuleInit(): Promise<void>;
    seedDefaultAdmin(): Promise<void>;
}
