import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    _id: 'user123',
    email: 'test@example.com',
    password: 'hashedpassword',
    name: 'Test User',
    toObject: jest.fn().mockReturnValue({
      _id: 'user123',
      email: 'test@example.com',
      password: 'hashedpassword',
      name: 'Test User',
    }),
  };

  const mockUsersService = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('fake_token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('deve retornar o usuário (sem senha) se as credenciais forem válidas', async () => {
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', '123456');

      expect(result).toEqual({
        _id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
      });
      expect(result).not.toHaveProperty('password');
    });

    it('deve retornar null se o usuário não for encontrado', async () => {
      mockUsersService.findOne.mockResolvedValue(null);
      const result = await service.validateUser('wrong@example.com', '123');
      expect(result).toBeNull();
    });

    it('deve retornar null se a senha estiver incorreta', async () => {
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser(
        'test@example.com',
        'wrongpass',
      );
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('deve retornar um token JWT', async () => {
      const result = await service.login(mockUser);
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser._id,
      });
      expect(result).toEqual({ access_token: 'fake_token' });
    });
  });
});
