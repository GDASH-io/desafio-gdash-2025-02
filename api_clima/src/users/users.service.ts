import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './entities/user.entity';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async onModuleInit() {
    const emailAdmin = 'admin@gdash.com';
    const adminExiste = await this.findByEmail(emailAdmin);

    if (!adminExiste) {
      console.log(' Criando usuário Admin padrão...');
      await this.create({
        nome: 'Admin GDASH',
        email: emailAdmin,
        senha: '123456',
      });
      console.log('Admin criado com sucesso!');
    } else {
      console.log('Usuário Admin já existe.');
    }
  }

  async create(createUserDto: CreateUserDto) {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll() {
    return this.userModel.find().exec();
  }

  async findOne(id: string) {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async remove(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
