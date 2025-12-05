import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
export declare class UsersService {
    private userModel;
    private jwtService;
    private readonly logger;
    constructor(userModel: Model<User>, jwtService: JwtService);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: string): Promise<{
        message: string;
    }>;
    login(loginUserDto: LoginUserDto): Promise<{
        access_token: string;
        user: User;
    }>;
    validateUser(userId: string): Promise<User>;
    private sanitizeUser;
}
