import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto, UpdateUserDto, UserRole } from './dto/user.dto';
import {
  IMongooseUserObject,
  IPaginatedResponse,
  IUserPublic,
} from './interface/user.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.createDefaultAdmin();
  }

  private async createDefaultAdmin() {
    const defaultEmail = this.configService.get<string>('ADMIN_EMAIL');
    const defaultPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (!defaultEmail || !defaultPassword) {
      console.error(
        '[UsersService] Variáveis ADMIN_EMAIL ou ADMIN_PASSWORD não definidas no .env!',
      );
      return;
    }

    const adminExists = await this.userModel
      .findOne({ email: defaultEmail })
      .exec();
    if (!adminExists) {
      const password_hash = await bcrypt.hash(defaultPassword, 10);
      await this.userModel.create({
        email: defaultEmail,
        password_hash,
        role: 'admin',
        is_active: true,
      });
      console.log(
        `[UsersService] Usuário Admin Padrão criado: ${defaultEmail}`,
      );
    }
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  cleanDocument(user: UserDocument): IUserPublic {
    const userObject = user.toObject() as IMongooseUserObject;
    const { password_hash, __v, ...publicUser } = userObject;
    return publicUser;
  }

  async create(createUserDto: CreateUserDto): Promise<IUserPublic> {
    const password_hash = await this.hashPassword(createUserDto.password);
    const createdUser = new this.userModel({
      ...createUserDto,
      password_hash,
    });
    const savedUserDocument = await createdUser.save();
    return this.cleanDocument(savedUserDocument);
  }

  async findByIdOrEmail(identifier: string): Promise<UserDocument> {
    let user: UserDocument | null = null;
    if (isValidObjectId(identifier)) {
      user = await this.userModel.findById(identifier).exec();
    }
    if (!user) {
      user = await this.userModel.findOne({ email: identifier }).exec();
    }
    if (!user) {
      throw new NotFoundException(`Usuário "${identifier}" não encontrado.`);
    }
    return user;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<IPaginatedResponse<IUserPublic>> {
    const skip = (page - 1) * limit;
    const totalItems = await this.userModel.countDocuments().exec();
    const users = await this.userModel.find().skip(skip).limit(limit).exec();
    const cleanedUsers = users.map((user) => this.cleanDocument(user));
    const totalPages = Math.ceil(totalItems / limit);
    return {
      pagina_atual: page,
      total_items: totalItems,
      total_paginas: totalPages,
      data: cleanedUsers,
    };
  }

  async update(
    id: string,
    updateDto: UpdateUserDto,
    currentUserRole: UserRole,
    currentUserId: string,
  ): Promise<IUserPublic> {
    const userToUpdate = await this.findByIdOrEmail(id);
    const isSelf = userToUpdate._id.toString() === currentUserId;
    const isAdmin = currentUserRole === 'admin';

    if (!isSelf && !isAdmin) {
      throw new BadRequestException(
        'Apenas administradores ou o próprio usuário podem atualizar este perfil.',
      );
    }
    if (updateDto.role && updateDto.role !== userToUpdate.role) {
      if (!isAdmin) {
        throw new BadRequestException(
          'Apenas administradores podem alterar a permissão (role) do usuário.',
        );
      }
    }
    const updateFields: Partial<UpdateUserDto> & { password_hash?: string } = {
      ...updateDto,
    };
    if (updateDto.password) {
      updateFields.password_hash = await this.hashPassword(updateDto.password);
      delete updateFields.password;
    }

    const updatedUserDocument = await this.userModel
      .findByIdAndUpdate(id, { $set: updateFields }, { new: true })
      .exec();

    if (!updatedUserDocument) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado.`);
    }
    return this.cleanDocument(updatedUserDocument);
  }

  async delete(id: string, currentUserRole: UserRole): Promise<void> {
    if (currentUserRole !== 'admin') {
      throw new BadRequestException(
        'Apenas administradores podem deletar usuários.',
      );
    }
    const userToDelete = await this.findByIdOrEmail(id);
    const result = await this.userModel
      .deleteOne({ _id: userToDelete._id })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado.`);
    }
  }
}
