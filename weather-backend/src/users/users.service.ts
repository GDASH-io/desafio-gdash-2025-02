import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async create(userData: Partial<User>): Promise<User> {
    const existingUser = await this.userModel.findOne({
      email: userData.email,
    });
    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    if (!userData.password) {
      throw new ConflictException('Senha é obrigatória');
    }
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const createdUser = new this.userModel({
      ...userData,
      password: hashedPassword,
    });

    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 12);
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, userData, { new: true })
      .select('-password');

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Usuário não encontrado');
    }
  }

  async createDefaultUser(): Promise<void> {
    const defaultUser = await this.userModel.findOne({
      email: 'admin@example.com',
    });
    if (!defaultUser) {
      await this.create({
        email: 'admin@example.com',
        password: '123456',
        name: 'Administrador',
        role: 'admin',
      });
    }
    throw new ConflictException('Default user already exists');
  }
}
