import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

const mockUsersService = {
  findOneByEmail: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock_token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('deve retornar o usuário (sem senha) se a validação for bem sucedida', async () => {
      const user = {
        email: 'test@test.com',
        password: 'hashedPassword',
        role: 'user',
      };
      mockUsersService.findOneByEmail.mockResolvedValue(user);

      // Mock do bcrypt.compare para retornar true
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      const result = await service.validateUser('test@test.com', 'correctPass');

      expect(result).toEqual({ email: 'test@test.com', role: 'user' });
      expect(result).not.toHaveProperty('password');
    });

    it('deve retornar null se a senha estiver incorreta', async () => {
      const user = { email: 'test@test.com', password: 'hashedPassword' };
      mockUsersService.findOneByEmail.mockResolvedValue(user);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      const result = await service.validateUser('test@test.com', 'wrongPass');
      expect(result).toBeNull();
    });

    it('deve retornar null se o usuário não existir', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);
      const result = await service.validateUser('ghost@test.com', 'pass');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('deve retornar o access_token', async () => {
      const user = { email: 'test@test.com', _id: '1', role: 'admin' };
      const result = await service.login(user);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user._id,
        role: user.role,
      });
      expect(result).toEqual({ access_token: 'mock_token' });
    });
  });
});
