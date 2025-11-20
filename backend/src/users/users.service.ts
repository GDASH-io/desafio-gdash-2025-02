import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);
    const user = new this.userModel({
      ...createUserDto,
      passwordHash,
      role: createUserDto.role || 'user',
    });

    return user.save();
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.userModel.find().select('-passwordHash').skip(skip).limit(limit).exec(),
      this.userModel.countDocuments().exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-passwordHash').exec();
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userModel.findOne({ email: updateUserDto.email });
      if (existingUser) {
        throw new ConflictException('Email já está em uso');
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    if (updateUserDto.password) {
      user.passwordHash = updateUserDto.password;
      delete (updateUserDto as any).password;
    }

    return user.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Usuário não encontrado');
    }
  }

  async createDefaultAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gdash.io';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await this.findByEmail(adminEmail);
    if (existingAdmin) {
      console.log('✅ Usuário admin já existe');
      return;
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await this.userModel.create({
      email: adminEmail,
      name: 'Administrador',
      passwordHash,
      role: 'admin',
    });

    console.log(`✅ Usuário admin criado: ${adminEmail} / ${adminPassword}`);
  }
}

