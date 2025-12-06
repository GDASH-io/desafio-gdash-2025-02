import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    name: 'Test User',
    toObject: jest.fn().mockReturnValue({
      _id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      name: 'Test User',
    }),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // TESTE 1: Service está definido
  // ==========================================
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ==========================================
  // TESTE 2: Login com credenciais válidas
  // ==========================================
  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: '123456',
      };

      // Mock: usuário existe
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      // Mock: senha correta
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Mock: gera token
      mockJwtService.sign.mockReturnValue('fake_jwt_token_123');

      const result = await service.login(loginDto);

      // Verificações
      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe('fake_jwt_token_123');
      expect(result.user.email).toBe(loginDto.email);
      expect(result.user).not.toHaveProperty('password'); // senha não deve ser retornada
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(jwtService.sign).toHaveBeenCalled();
    });

    // ==========================================
    // TESTE 3: Login com email inválido
    // ==========================================
    it('should throw UnauthorizedException for invalid email', async () => {
      const loginDto = {
        email: 'notfound@example.com',
        password: '123456',
      };

      // Mock: usuário não existe
      mockUsersService.findByEmail.mockResolvedValue(null);

      // Verificar se lança exceção
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Credenciais inválidas',
      );
    });

    // ==========================================
    // TESTE 4: Login com senha inválida
    // ==========================================
    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      // Mock: usuário existe
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      // Mock: senha incorreta
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Verificar se lança exceção
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ==========================================
  // TESTE 5: Validar usuário
  // ==========================================
  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', '123456');

      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
      expect(result).not.toHaveProperty('password');
    });

    it('should return null if credentials are invalid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrong');

      expect(result).toBeNull();
    });
  });
});