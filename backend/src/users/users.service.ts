import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly configService: ConfigService,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        const hashed = await bcrypt.hash(createUserDto.password, 10);
        const created = new this.userModel({
            ...createUserDto,
            password: hashed,
            role: 'user',
        });
        const saved = await created.save();
        const { password, ...safe } = saved.toObject();
        return safe as User;
    }

    async findAll(): Promise<User[]> {
        return this.userModel.find().select('-password').lean();
    }

    async findOne(id: string): Promise<User | null> {
        return this.userModel.findById(id).select('-password').lean();
    }

    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
        const payload = { ...updateUserDto };
        if (updateUserDto.password) {
            payload.password = await bcrypt.hash(updateUserDto.password, 10);
        }
        const updated = await this.userModel.findByIdAndUpdate(id, payload, { new: true }).exec();
        if (!updated) {
            return null;
        }
        const { password, ...safe } = updated.toObject();
        return safe as User;
    }

    async remove(id: string): Promise<void> {
        await this.userModel.findByIdAndDelete(id).exec();
    }

    async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new NotFoundException('Usuario nao encontrado');
        }
        const isValid = await bcrypt.compare(oldPassword, user.password ?? '');
        if (!isValid) {
            throw new UnauthorizedException('Senha atual incorreta');
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
    }

    async ensureDefaultUser(): Promise<void> {
        const email = this.configService.get<string>('DEFAULT_USER_EMAIL');
        const password = this.configService.get<string>('DEFAULT_USER_PASSWORD');
        const name = this.configService.get<string>('DEFAULT_USER_NAME');
        if (!email || !password) {
            this.logger.warn('usuário padrão não configurado (variáveis DEFAULT_USER_*)');
            return;
        }

        const existing = await this.userModel.findOne({ email }).exec();
        if (existing) {
            return;
        }

        await this.create({
            email,
            name: name ?? 'Administrador',
            password,
        });
        this.logger.log(`usuário padrão ${email} criado`);
    }
}