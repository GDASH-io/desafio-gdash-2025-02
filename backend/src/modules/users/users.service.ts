import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async onModuleInit() {
    // ... (Mantenha sua lógica de seed do admin aqui) [cite: 111-114]
    const adminEmail = 'admin@example.com';
    const adminExists = await this.userModel.findOne({ email: adminEmail });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await this.userModel.create({
        email: adminEmail,
        password: hashedPassword,
        name: 'Administrador GDASH',
      });
      console.log('✅ Usuário ADMIN criado com sucesso.');
    }
  }

  // Criação (ajustada para usar o DTO)
  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    return createdUser.save();
  }

  // Listar todos (excluindo a senha do retorno)
  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  // Buscar por ID
  async findOneById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  // Buscar por Email (útil para o Login/Auth)
  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  // Atualizar
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Se estiver atualizando a senha, precisamos criptografá-la novamente
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true }) // new: true retorna o objeto atualizado
      .select('-password') // não retorna a senha
      .exec();

    if (!updatedUser) throw new NotFoundException('Usuário não encontrado para atualização');
    return updatedUser;
  }

  // Deletar
  async remove(id: string): Promise<{ message: string }> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Usuário não encontrado para remoção');
    return { message: 'Usuário removido com sucesso' };
  }
}