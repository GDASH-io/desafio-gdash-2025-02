import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from './user.schema';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) { }

  async onModuleInit() {
    await this.ensureAdminUser();
  }
  
  private async ensureAdminUser() {
    try {
      const email = 'admin@example.com';

      const exists = await this.userModel.findOne({ email });

      if (exists) {
        console.log('👤 Admin já existe, ignorando...');
        return;
      }

      const hashed = await bcrypt.hash('123456', 10);

      await this.userModel.create({
        email,
        password: hashed,
        role: 'admin',
      });

      console.log('🚀 Usuário admin criado automaticamente!');

    } catch (err) {
      console.log('Duplicidade!')
    }
  }

  async findAll() {
    return this.userModel.find().select('-password').exec();
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async create(data: any) {
    const user = new this.userModel(data);
    return user.save();
  }

  async updateUser(id: string, data: any) {
    return this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }


  async deleteUser(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
