import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { comparePassword } from '../utils/hash-password';
import { Role } from '../users/enums/role.enum';

jest.mock('../utils/hash-password');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: Role.USER,
  };

  beforeEach(async () => {
    const mockUsersService = {
      findUserByEmail: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

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
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);

    (comparePassword as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access token and user data on successful login', async () => {
      usersService.findUserByEmail.mockResolvedValue(mockUser as any);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login('test@example.com', 'password123');

      expect(usersService.findUserByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(comparePassword).toHaveBeenCalledWith(
        'password123',
        'hashedPassword123',
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: 'test@example.com',
        sub: '507f1f77bcf86cd799439011',
        role: Role.USER,
      });
      expect(result).toEqual({
        access_token: 'jwt-token',
        user: {
          id: '507f1f77bcf86cd799439011',
          email: 'test@example.com',
          role: Role.USER,
        },
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      usersService.findUserByEmail.mockResolvedValue(null);

      await expect(() =>
        service.login('test@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(() =>
        service.login('test@example.com', 'password123'),
      ).rejects.toThrow('Invalid credentials');

      expect(comparePassword).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      usersService.findUserByEmail.mockResolvedValue(mockUser as any);
      (comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(() =>
        service.login('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(() =>
        service.login('test@example.com', 'wrongpassword'),
      ).rejects.toThrow('Invalid credentials');

      expect(comparePassword).toHaveBeenCalledWith(
        'wrongpassword',
        'hashedPassword123',
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
