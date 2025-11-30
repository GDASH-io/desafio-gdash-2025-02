import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { commonConstants } from 'src/shared/constants';
import { UserRole } from 'src/types';
import { EncryptService } from '../encrypt/encrypt.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserDocument } from '../users/infraestructure/schema/user.schema';
import { SignInDto } from './dto/sign-in.dto';
import { AuthRepositoryPort } from './ports/auth.repository.port';

@Injectable()
export class AuthService {
  constructor(
    @Inject(commonConstants.ports.AUTH)
    private readonly authRepo: AuthRepositoryPort,
    private readonly encryptionService: EncryptService,
  ) {}
  private readonly logger = new Logger(AuthService.name);

  async signIn(
    signDto: SignInDto,
  ): Promise<{ token: string; user: { id: string; role: UserRole } }> {
    const userExists = await this.authRepo.findUserByEmail(signDto.email);
    if (!userExists) {
      throw new UnauthorizedException('Credenciais Inválidas');
    }

    const isValidPassword = await this.encryptionService.verifyPassword(
      userExists.password,
      signDto.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Credenciais Inválidas');
    }

    const token = await this.encryptionService.generateNewToken({
      id: userExists._id,
      name: userExists.name,
      email: userExists.email,
      role: userExists.role,
    });

    this.logger.log(`User ${userExists.email} signed in successfully`);
    return {
      token,
      user: { id: userExists._id?.toString() || '', role: userExists.role },
    };
  }

  async signUp(
    createUserDto: CreateUserDto,
  ): Promise<{ user: UserDocument; token: string }> {
    const userExists = await this.authRepo.findUserByEmail(createUserDto.email);

    if (userExists) {
      this.logger.warn('User already exists: ' + createUserDto.email);
      throw new ConflictException('Usuário já existe');
    }

    const hashedPassword = await this.encryptionService.encryptPassword(
      createUserDto.password,
    );

    const user = await this.authRepo.createUser({
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashedPassword,
      role: createUserDto.role,
    });

    const token = await this.encryptionService.generateNewToken({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    this.logger.log(`User signed up successfully: ${createUserDto.email}`);
    return { user, token };
  }
}
