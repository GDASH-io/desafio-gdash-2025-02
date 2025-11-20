import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Role } from '../users/enums/role.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockLoginResult = {
    access_token: 'jwt-token',
    user: {
      id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      role: Role.USER,
    },
  };

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should login successfully and set httpOnly cookie', async () => {
      authService.login.mockResolvedValue(mockLoginResult as any);

      const mockResponse = {
        cookie: jest.fn(),
      } as any;

      const result = await controller.login(
        { email: 'test@example.com', password: 'password123' },
        mockResponse,
      );

      expect(authService.login).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        'jwt-token',
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        },
      );
      expect(result).toEqual({ user: mockLoginResult.user });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      authService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      const mockResponse = {
        cookie: jest.fn(),
      } as any;

      await expect(() =>
        controller.login(
          { email: 'test@example.com', password: 'wrongpassword' },
          mockResponse,
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when email format is invalid', async () => {
      const mockResponse = {
        cookie: jest.fn(),
      } as any;

      await expect(() =>
        controller.login(
          { email: 'invalid-email', password: 'password123' },
          mockResponse,
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(authService.login).not.toHaveBeenCalled();
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should clear access_token cookie', () => {
      const mockResponse = {
        clearCookie: jest.fn(),
      } as any;

      const result = controller.logout(mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('access_token');
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});
