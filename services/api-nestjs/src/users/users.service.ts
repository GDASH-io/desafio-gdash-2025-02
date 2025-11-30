import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schema/user.schema';
import { CreateUserDto, ResponseUserDto } from 'src/DTO/user.dto';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
    ) { }
    async createUser(userData: CreateUserDto): Promise<ResponseUserDto> {
        const createdUser = new this.userModel(userData);
        const senha_hash = await bcrypt.hash(createdUser.senha, 10);
        createdUser.senha = senha_hash;
        const saved = await createdUser.save();
        return {
            id: saved._id.toString(),
            nome: saved.nome,
            email: saved.email,
            funcao: saved.funcao,
        };
    }

    async getAllUsers(): Promise<ResponseUserDto[]> {
        const users = await this.userModel.find().exec();
        return users.map(user => ({
            id: user._id.toString(),
            nome: user.nome,
            email: user.email,
            funcao: user.funcao,
        }));
    }
    async updateUser(id: string, userData: Partial<CreateUserDto>): Promise<ResponseUserDto> {
        const updated = await this.userModel.findByIdAndUpdate(id, userData, { new: true });
        if (!updated) {
            throw new Error('Usuário não encontrado');
        }
        return {
            id: updated._id.toString(),
            nome: updated.nome,
            email: updated.email,
            funcao: updated.funcao,
        };
    }

    async deleteUser(id: string): Promise<void> {
        await this.userModel.findByIdAndDelete(id);
    }
}