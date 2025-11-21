import { Injectable, Logger, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Verifica se o usuário já existe
      const existingUser = await this.userModel.findOne({ email: createUserDto.email });
      if (existingUser) {
        this.logger.warn(`❌ Tentativa de criar usuário com email já registrado: ${createUserDto.email}`);
        throw new ConflictException('Email já está registrado');
      }

      // Criptografa a senha
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      // Cria o usuário
      const user = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
      });

      await user.save();
      this.logger.log(`✅ Usuário criado com sucesso: ${createUserDto.email}`);

      // Retorna sem a senha
      return this.sanitizeUser(user);
    } catch (error) {
      this.logger.error(`❌ Erro ao criar usuário: ${error.message}`);
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const users = await this.userModel.find().select('-password');
      this.logger.log(`📊 Total de usuários encontrados: ${users.length}`);
      return users;
    } catch (error) {
      this.logger.error(`❌ Erro ao listar usuários: ${error.message}`);
      throw error;
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      const user = await this.userModel.findById(id).select('-password');
      if (!user) {
        this.logger.warn(`❌ Usuário não encontrado: ${id}`);
        throw new NotFoundException('Usuário não encontrado');
      }
      return user;
    } catch (error) {
      this.logger.error(`❌ Erro ao buscar usuário: ${error.message}`);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.userModel.findOne({ email });
      return user;
    } catch (error) {
      this.logger.error(`❌ Erro ao buscar usuário por email: ${error.message}`);
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const updateData = { ...updateUserDto };

      // Se a senha está sendo atualizada, criptografa
      if (updateUserDto.password) {
        updateData.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      const user = await this.userModel.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
      
      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      this.logger.log(`✅ Usuário atualizado: ${id}`);
      return user;
    } catch (error) {
      this.logger.error(`❌ Erro ao atualizar usuário: ${error.message}`);
      throw error;
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      const user = await this.userModel.findByIdAndDelete(id);
      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      this.logger.log(`✅ Usuário deletado: ${id}`);
      return { message: 'Usuário removido com sucesso' };
    } catch (error) {
      this.logger.error(`❌ Erro ao deletar usuário: ${error.message}`);
      throw error;
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<{ access_token: string; user: User }> {
    try {
      const user = await this.findByEmail(loginUserDto.email);
      if (!user) {
        this.logger.warn(`❌ Tentativa de login com email não registrado: ${loginUserDto.email}`);
        throw new UnauthorizedException('Email ou senha incorretos');
      }

      // Verifica a senha
      const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);
      if (!isPasswordValid) {
        this.logger.warn(`❌ Tentativa de login com senha incorreta: ${loginUserDto.email}`);
        throw new UnauthorizedException('Email ou senha incorretos');
      }

      // Gera JWT
      const access_token = this.jwtService.sign(
        { sub: user._id, email: user.email },
        { expiresIn: '24h' },
      );

      this.logger.log(`✅ Usuário autenticado: ${loginUserDto.email}`);

      return {
        access_token,
        user: this.sanitizeUser(user),
      };
    } catch (error) {
      this.logger.error(`❌ Erro no login: ${error.message}`);
      throw error;
    }
  }

  async validateUser(userId: string): Promise<User> {
    try {
      const user = await this.findOne(userId);
      return user;
    } catch (error) {
      this.logger.error(`❌ Erro ao validar usuário: ${error.message}`);
      throw error;
    }
  }

  private sanitizeUser(user: User): User {
    const { password, ...result } = user.toObject();
    return result as User;
  }
}