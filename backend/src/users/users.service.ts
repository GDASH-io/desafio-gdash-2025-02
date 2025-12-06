import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { IUsersRepository } from './domain/users.repository.interface';
import { UserEntity } from './domain/user.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Either, left, right } from '../shared/core/either';

export type CreateUserResponse = Either<Error, UserEntity>;

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject(IUsersRepository) private usersRepository: IUsersRepository,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const email = this.configService.get<string>('DEFAULT_ADMIN_EMAIL', 'admin@example.com');
    const password = this.configService.get<string>('DEFAULT_ADMIN_PASSWORD');
    
    if (!password) {
      this.logger.warn('DEFAULT_ADMIN_PASSWORD not set. Skipping default user creation for security.');
      return;
    }
    
    const existingUser = await this.findOne(email);
    if (!existingUser) {
      this.logger.log('Creating default admin user...');
      await this.create({ email, password });
    }
  }

  async create(createUserDto: any): Promise<CreateUserResponse> {
    const existing = await this.usersRepository.findByEmail(createUserDto.email);
    if (existing) {
      return left(new Error('User already exists'));
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    
    const newUser = new UserEntity(createUserDto.email, hashedPassword);
    const created = await this.usersRepository.create(newUser);
    
    return right(created);
  }

  async findOne(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findByEmail(email);
  }
  
  async findAll(): Promise<UserEntity[]> {
    return this.usersRepository.findAll();
  }
}
