import { Injectable, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  // Cria usuário padrão 'admin' se não existir
  async onModuleInit() {
    const adminExists = await this.userModel.findOne({ username: 'admin' });
    if (!adminExists) {
      const admin = new this.userModel({
        username: 'admin',
        password: '123456',
      });
      await admin.save();
      console.log('👤 Usuário padrão criado: admin / 123456');
    }
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userModel.findOne({ username });
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
