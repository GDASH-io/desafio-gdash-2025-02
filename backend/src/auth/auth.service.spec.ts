import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { HttpException, UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    count: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return access token', async () => {
      const registerDto: RegisterDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        ...registerDto,
        role: 'user',
      };

      const mockToken = 'mock-jwt-token';

      mockUsersService.count.mockResolvedValue(1); // Não é o primeiro usuário
      mockUsersService.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.register(registerDto);

      expect(usersService.create).toHaveBeenCalledWith({
        ...registerDto,
        role: 'user',
      });
      expect(jwtService.sign).toHaveBeenCalled();
      const signCall = (mockJwtService.sign as jest.Mock).mock.calls[0][0];
      expect(signCall.email).toBe(mockUser.email);
      expect(signCall.sub).toBeDefined();
      expect(result).toHaveProperty('access_token', mockToken);
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(registerDto.email);
    });

    it('should throw HttpException when user creation fails', async () => {
      const registerDto: RegisterDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      mockUsersService.create.mockRejectedValue(
        new HttpException('Email já está em uso', 409),
      );

      await expect(service.register(registerDto)).rejects.toThrow(HttpException);
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        role: 'user',
      };

      const mockToken = 'mock-jwt-token';

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(loginDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(jwtService.sign).toHaveBeenCalled();
      const signCall = (mockJwtService.sign as jest.Mock).mock.calls[0][0];
      expect(signCall.email).toBe(mockUser.email);
      expect(signCall.sub).toBeDefined();
      expect(result).toHaveProperty('access_token', mockToken);
      expect(result).toHaveProperty('user');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user object without password when credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        role: 'user',
        toObject: jest.fn().mockReturnValue({
          _id: '507f1f77bcf86cd799439011',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
        }),
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('email', email);
    });

    it('should return null when user not found', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
    });
  });
});

