import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { commonConstants } from 'src/shared/constants';
import { UserRole } from 'src/types';
import { EncryptService } from '../../encrypt/encrypt.service';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { UserDocument } from '../../users/infraestructure/schema/user.schema';
import { AuthService } from '../auth.service';
import { SignInDto } from '../dto/sign-in.dto';
import { InMemoryAuthRepository } from '../infraestructure/adapters/inMemory-auth.repository';

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: InMemoryAuthRepository;
  let encryptService: jest.Mocked<EncryptService>;

  beforeEach(async () => {
    const mockEncryptService = {
      encryptPassword: jest.fn(),
      verifyPassword: jest.fn(),
      generateNewToken: jest.fn(),
      verifyAuthToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: commonConstants.ports.AUTH,
          useClass: InMemoryAuthRepository,
        },
        {
          provide: EncryptService,
          useValue: mockEncryptService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    authRepository = module.get<InMemoryAuthRepository>(
      commonConstants.ports.AUTH,
    );
    encryptService = module.get(EncryptService);

    authRepository.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    const signInDto: SignInDto = {
      email: 'user@example.com',
      password: 'password123',
    };

    const mockUser: UserDocument = {
      _id: '1',
      name: 'John Doe',
      email: 'user@example.com',
      password: '$2b$10$hashedPassword',
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as UserDocument;

    it('should sign in successfully with valid credentials', async () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token.signature';

      encryptService.encryptPassword.mockResolvedValue(mockUser.password);
      await authRepository.createUser({
        name: mockUser.name,
        email: mockUser.email,
        password: mockUser.password,
      });

      encryptService.verifyPassword.mockResolvedValue(true);
      encryptService.generateNewToken.mockResolvedValue(token);

      const result = await service.signIn(signInDto);

      expect(result).toBeDefined();
      expect(result.token).toBe(token);
      expect(result.user).toBeDefined();
      expect(encryptService.verifyPassword).toHaveBeenCalledWith(
        mockUser.password,
        signInDto.password,
      );
      expect(encryptService.generateNewToken).toHaveBeenCalledWith({
        id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      await expect(service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.signIn(signInDto)).rejects.toThrow(
        'Credenciais Inválidas',
      );
      expect(encryptService.verifyPassword).not.toHaveBeenCalled();
      expect(encryptService.generateNewToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      // Setup: create user in repository
      encryptService.encryptPassword.mockResolvedValue(mockUser.password);
      await authRepository.createUser({
        name: mockUser.name,
        email: mockUser.email,
        password: mockUser.password,
      });

      encryptService.verifyPassword.mockResolvedValue(false);

      await expect(service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.signIn(signInDto)).rejects.toThrow(
        'Credenciais Inválidas',
      );
      expect(encryptService.verifyPassword).toHaveBeenCalledWith(
        mockUser.password,
        signInDto.password,
      );
      expect(encryptService.generateNewToken).not.toHaveBeenCalled();
    });

    it('should call verifyPassword with correct parameters', async () => {
      encryptService.encryptPassword.mockResolvedValue(mockUser.password);
      await authRepository.createUser({
        name: mockUser.name,
        email: mockUser.email,
        password: mockUser.password,
      });

      encryptService.verifyPassword.mockResolvedValue(true);
      encryptService.generateNewToken.mockResolvedValue('token');

      await service.signIn(signInDto);

      expect(encryptService.verifyPassword).toHaveBeenCalledTimes(1);
      expect(encryptService.verifyPassword).toHaveBeenCalledWith(
        mockUser.password,
        signInDto.password,
      );
    });

    it('should generate token with correct user payload', async () => {
      const token = 'generated-token';
      encryptService.encryptPassword.mockResolvedValue(mockUser.password);

      const createdUser = await authRepository.createUser({
        name: mockUser.name,
        email: mockUser.email,
        password: mockUser.password,
      });

      encryptService.verifyPassword.mockResolvedValue(true);
      encryptService.generateNewToken.mockResolvedValue(token);

      await service.signIn(signInDto);

      expect(encryptService.generateNewToken).toHaveBeenCalledWith({
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
      });
    });

    it('should return user id as string', async () => {
      encryptService.encryptPassword.mockResolvedValue(mockUser.password);
      await authRepository.createUser({
        name: mockUser.name,
        email: mockUser.email,
        password: mockUser.password,
      });

      encryptService.verifyPassword.mockResolvedValue(true);
      encryptService.generateNewToken.mockResolvedValue('token');

      const result = await service.signIn(signInDto);

      expect(typeof result.user.id).toBe('string');
      expect(typeof result.user.role).toBeTruthy();
      expect(result.user).toBeTruthy();
    });
  });

  describe('signUp', () => {
    const createUserDto: CreateUserDto = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'securePassword123',
    };

    it('should sign up a new user successfully', async () => {
      const hashedPassword = '$2b$10$hashedSecurePassword';
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.signup.token';

      encryptService.encryptPassword.mockResolvedValue(hashedPassword);
      encryptService.generateNewToken.mockResolvedValue(token);

      const result = await service.signUp(createUserDto);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.name).toBe(createUserDto.name);
      expect(result.user.email).toBe(createUserDto.email);
      expect(result.user.password).toBe(hashedPassword);
      expect(result.token).toBe(token);
    });

    it('should hash the password before creating user', async () => {
      const hashedPassword = '$2b$10$hashedPassword';
      encryptService.encryptPassword.mockResolvedValue(hashedPassword);
      encryptService.generateNewToken.mockResolvedValue('token');

      await service.signUp(createUserDto);

      expect(encryptService.encryptPassword).toHaveBeenCalledTimes(1);
      expect(encryptService.encryptPassword).toHaveBeenCalledWith(
        createUserDto.password,
      );
    });

    it('should throw ConflictException when user already exists', async () => {
      const hashedPassword = '$2b$10$hashedPassword';
      encryptService.encryptPassword.mockResolvedValue(hashedPassword);
      encryptService.generateNewToken.mockResolvedValue('token');

      // Create user first
      await service.signUp(createUserDto);

      // Try to create again with same email
      await expect(service.signUp(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.signUp(createUserDto)).rejects.toThrow(
        'Usuário já existe',
      );
    });

    it('should generate token with correct user payload', async () => {
      const hashedPassword = '$2b$10$hashedPassword';
      const token = 'generated-token';

      encryptService.encryptPassword.mockResolvedValue(hashedPassword);
      encryptService.generateNewToken.mockResolvedValue(token);

      const result = await service.signUp(createUserDto);

      expect(encryptService.generateNewToken).toHaveBeenCalledWith({
        id: result.user._id,
        name: createUserDto.name,
        email: createUserDto.email,
        role: result.user.role,
      });
    });

    it('should store user with hashed password in repository', async () => {
      const hashedPassword = '$2b$10$hashedPassword';
      encryptService.encryptPassword.mockResolvedValue(hashedPassword);
      encryptService.generateNewToken.mockResolvedValue('token');

      await service.signUp(createUserDto);

      const users = authRepository.getAll();
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe(createUserDto.email);
      expect(users[0].password).toBe(hashedPassword);
      expect(users[0].password).not.toBe(createUserDto.password);
    });

    it('should return both user and token', async () => {
      const hashedPassword = '$2b$10$hashedPassword';
      const token = 'jwt-token';

      encryptService.encryptPassword.mockResolvedValue(hashedPassword);
      encryptService.generateNewToken.mockResolvedValue(token);

      const result = await service.signUp(createUserDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user).toBeInstanceOf(Object);
      expect(typeof result.token).toBe('string');
    });

    it('should create user with correct data structure', async () => {
      const hashedPassword = '$2b$10$hashedPassword';
      encryptService.encryptPassword.mockResolvedValue(hashedPassword);
      encryptService.generateNewToken.mockResolvedValue('token');

      const result = await service.signUp(createUserDto);

      expect(result.user._id).toBeDefined();
      expect(result.user.name).toBe(createUserDto.name);
      expect(result.user.email).toBe(createUserDto.email);
      expect(result.user.createdAt).toBeInstanceOf(Date);
      expect(result.user.updatedAt).toBeInstanceOf(Date);
    });

    it('should not call generateNewToken if user already exists', async () => {
      const hashedPassword = '$2b$10$hashedPassword';
      encryptService.encryptPassword.mockResolvedValue(hashedPassword);
      encryptService.generateNewToken.mockResolvedValue('token');

      await service.signUp(createUserDto);

      // Clear mocks to check second call
      jest.clearAllMocks();

      await expect(service.signUp(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(encryptService.generateNewToken).not.toHaveBeenCalled();
    });
  });
});
