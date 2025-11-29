import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto'; 
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(payload: CreateUserDto) { 
    const existing = await this.userModel.findOne({ email: payload.email });
    if (existing) {
        throw new ConflictException('Email já cadastrado');
    }

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(payload.password, salt);

    const newUser = new this.userModel({ 
        email: payload.email, 
        password: hashPassword 
    });
    await newUser.save();

    return { 
        id: newUser._id, 
        email: newUser.email, 
        message: 'Usuário criado com sucesso' 
    };
  }
  async findAll(): Promise<User[]> { 
    return this.userModel.find().select('-password').exec(); 
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }
    
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true }) 
      .select('-password') 
      .exec();

    if (!updatedUser) {
        throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    return updatedUser;
  }

  async remove(id: string) {
  const user = await this.userModel.findById(id).exec();

  if (!user) {
    throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
  }

  if (user.email === 'gdash@gdash.com') {
    throw new ForbiddenException('Não é permitido deletar o usuário administrador padrão do sistema.');
  }

  const deletedUser = await this.userModel.findByIdAndDelete(id).exec();

  if (!deletedUser) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
  }

  return { message: 'Usuário removido com sucesso', id };
}
}