import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async onModuleInit() {
    const adminEmail = 'admin@example.com';
    const adminExists = await this.userModel
      .findOne({ email: adminEmail })
      .exec();

    if (!adminExists) {
      this.logger.log('🌱 Criando usuário Admin padrão...');
      await this.create(adminEmail, '123456', 'Admin GDASH');
    } else {
      this.logger.log('✅ Usuário Admin já existe.');
    }
  }

  async create(email: string, pass: string, name: string): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(pass, salt);

    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      name,
    });
    return newUser.save();
  }

  async findOne(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, data: any): Promise<UserDocument | null> {
    if (data.password) {
      const salt = await bcrypt.genSalt();
      data.password = await bcrypt.hash(data.password, salt);
    }

    return this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async remove(id: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
