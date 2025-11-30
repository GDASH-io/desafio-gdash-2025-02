import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { commonConstants } from 'src/shared/constants';
import { EncryptService } from '../encrypt/encrypt.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDocument } from './infraestructure/schema/user.schema';
import { UserRepositoryPort } from './ports/user.repository.port';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @Inject(commonConstants.ports.USERS)
    private readonly userRepository: UserRepositoryPort,
    private readonly encryptionService: EncryptService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const userExists = await this.userExists(createUserDto.email);

    if (userExists) {
      this.logger.warn('User already exists: ' + createUserDto.email);
      throw new ConflictException('Usuário já existe');
    }

    const hashedPassword = await this.encryptionService.encryptPassword(
      createUserDto.password,
    );

    const user = await this.userRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashedPassword,
      role: createUserDto.role,
    });
    this.logger.log(`User created successfully: ${createUserDto.email}`);
    return user;
  }

  async findAll(): Promise<UserDocument[]> {
    const users = await this.userRepository.findAll();

    return users;
  }

  async findOne(id: string): Promise<UserDocument> {
    const user = await this.userRepository.findOneById(id);

    if (!user) {
      throw this.notFoundUserException();
    }

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    const userExists = await this.userExists(updateUserDto.email || '');

    if (userExists && userExists._id && userExists._id.toString() !== id) {
      this.logger.warn('Email already in use: ' + updateUserDto.email);
      throw new ConflictException('Email já está em uso');
    }

    const user = await this.userRepository.update(id, updateUserDto);

    if (!user) {
      this.logger.warn('User not found with id: ' + id);
      throw this.notFoundUserException();
    }
    this.logger.log(`User updated successfully: ${id}`);
    return user;
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOneById(id);

    if (!user) {
      this.logger.warn('User not found with id: ' + id);
      throw this.notFoundUserException();
    }

    await this.userRepository.remove(id);
    this.logger.log(`User deleted successfully: ${id}`);
  }

  private notFoundUserException(): NotFoundException {
    return new NotFoundException('Usuário não encontrado');
  }

  private async userExists(email: string): Promise<UserDocument | null> {
    const userExists = await this.userRepository.findByEmail(email);
    return userExists;
  }
}
