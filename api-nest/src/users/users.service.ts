import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectModel('User') private userModel: Model<any>,
  ) {}

  async onModuleInit() {
    const admin = await this.userModel.findOne({ email: "admin@gdash.com" });

    if (!admin) {
      const hashed = await bcrypt.hash("123456", 10);
      await this.userModel.create({ 
        name: "Administrador",
        email: "admin@gdash.com",
        password: hashed,
        role: "admin"
      });
      console.log("Usuário admin criado: admin@gdash.com / 123456");
    }
  }

  async findAll() {
    return this.userModel.find();
  }

  async findById(id: string): Promise<any> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async create(data: any) {
    const hashed = await bcrypt.hash(data.password, 10);
    return this.userModel.create({ ...data, password: hashed });
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
