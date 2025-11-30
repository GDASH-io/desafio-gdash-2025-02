import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  Inject,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { IUsersRepository } from './repositories/users.repository.interface';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject('IUsersRepository')
    private readonly usersRepository: IUsersRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {}

  // --- SEED: Cria usuário admin ao iniciar ---
  async onModuleInit() {
    const adminEmail = this.configService.get<string>('DEFAULT_ADMIN_EMAIL');
    const adminPass = this.configService.get<string>('DEFAULT_ADMIN_PASSWORD');

    if (adminEmail && adminPass) {
      // Usa o método do repositório
      const exists = await this.usersRepository.findByEmail(adminEmail);
      if (!exists) {
        this.logger.log(`Criando Admin Padrão: ${adminEmail}`);
        await this.create({
          email: adminEmail,
          password: adminPass,
          role: 'admin',
        });
      }
    }
  }

  // Criação com invalidação de cache
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, role } = createUserDto;

    const userExists = await this.usersRepository.findByEmail(email);
    if (userExists) {
      throw new BadRequestException('Email já está em uso.');
    }

    // Regra de Negócio: Criptografia
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Monta o objeto para o repositório salvar
    // (Ajustamos o DTO pois a senha foi hashada)
    const userToCreate = {
      ...createUserDto,
      password: hashedPassword,
      role,
    };

    const savedUser = await this.usersRepository.create(userToCreate);
    await this.cacheManager.clear(); // Invalida o cache

    return savedUser;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  // Método auxiliar para o AuthModule
  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.email) {
      const userExists = await this.usersRepository.findByEmail(
        updateUserDto.email,
      );

      // Garante que não é o próprio usuário (caso ele mande o mesmo email)
      if (userExists && userExists['_id'].toString() !== id) {
        throw new BadRequestException(
          'Este e-mail já está em uso por outro usuário.',
        );
      }
    }

    // SE o usuário mandou uma nova senha, precisamos criptografar antes
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    const updatedUser = await this.usersRepository.findById(id);

    if (!updatedUser) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    await this.cacheManager.clear(); // Invalida o cache para refletir mudanças

    return updatedUser;
  }

  async remove(id: string): Promise<User> {
    const deletedUser = await this.usersRepository.delete(id);

    if (!deletedUser) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    await this.cacheManager.clear(); // Invalida o cache para refletir mudanças

    return deletedUser;
  }
}
