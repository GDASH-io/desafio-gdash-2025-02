import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './users.schema';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  // 🚀 Cria o usuário admin automaticamente
  async onModuleInit() {
    const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@gdash.com';
    const password = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

    const exists = await this.userModel.findOne({ email });

    if (!exists) {
      const hashed = await bcrypt.hash(password, 10);
await this.userModel.create({
  name: 'Administrador',
  email,
  password: hashed,
  role: 'admin',
});


      console.log('👤 Usuário admin criado automaticamente:', email);
    }
  }

  async findAll() {
    return this.userModel.find();
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async findById(id: string) {
    return this.userModel.findById(id);
  }

  async create(data: any) {
    data.password = await bcrypt.hash(data.password, 10);
    return this.userModel.create(data);
  }

  async update(id: string, data: any) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return this.userModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }
}
