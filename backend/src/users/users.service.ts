import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar se email já existe
    const existingUser = await this.userModel.findOne({ 
      email: createUserDto.email 
    });
    
    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Criar usuário
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return user.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Se está atualizando senha, fazer hash
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException('Usuário não encontrado');
    }
  }

  async createDefaultUser(): Promise<void> {
    const defaultEmail = process.env.DEFAULT_USER_EMAIL || 'admin@example.com';
    
    const existingUser = await this.findByEmail(defaultEmail);
    
    if (!existingUser) {
      await this.create({
        email: defaultEmail,
        password: process.env.DEFAULT_USER_PASSWORD || '123456',
        name: process.env.DEFAULT_USER_NAME || 'Admin WeAIther',
      });
      
      console.log('✅ Usuário padrão criado:', defaultEmail);
    }
  }
}