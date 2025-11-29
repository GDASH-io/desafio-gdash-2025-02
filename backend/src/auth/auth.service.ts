import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'; 

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Senha incorreta');
    }

    const payload = { sub: user._id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user_email: user.email
    };
  }

  async register(email: string, pass: string) {
    const existing = await this.userModel.findOne({ email });
    if (existing) throw new ConflictException('Email já cadastrado');

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(pass, salt);

    const newUser = new this.userModel({ email, password: hashPassword });
    await newUser.save();

    return { 
      id: newUser._id, 
      email: newUser.email, 
      message: 'Usuário criado com sucesso' 
    };
  }
}