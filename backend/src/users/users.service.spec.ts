import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock do Repositório
const mockUsersRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Mock do Cache
const mockCacheManager = {
  clear: jest.fn(),
};

// Mock do ConfigService
const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'DEFAULT_ADMIN_EMAIL') return 'admin@test.com';
    if (key === 'DEFAULT_ADMIN_PASSWORD') return '123456';
    return null;
  }),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: 'IUsersRepository', useValue: mockUsersRepository },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um usuário com senha hashada e limpar o cache', async () => {
      const dto = { email: 'test@test.com', password: 'pass', role: 'user' };

      // Mock do bcrypt
      jest
        .spyOn(bcrypt, 'genSalt')
        .mockImplementation(() => Promise.resolve('salt'));
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve('hashedPass'));

      mockUsersRepository.findByEmail.mockResolvedValue(null);
      mockUsersRepository.create.mockResolvedValue({
        ...dto,
        password: 'hashedPass',
        _id: '1',
      });

      const result = await service.create(dto);

      expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith('pass', 'salt');
      expect(mockUsersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'hashedPass',
        }),
      );
      expect(mockCacheManager.clear).toHaveBeenCalled();
      expect(result).toHaveProperty('_id', '1');
    });

    it('deve falhar se o email já existir', async () => {
      const dto = { email: 'exist@test.com', password: 'pass' };
      mockUsersRepository.findByEmail.mockResolvedValue({
        _id: '1',
        email: 'exist@test.com',
      });

      await expect(service.create(dto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de usuários', async () => {
      const users = [{ email: 'a@a.com' }, { email: 'b@b.com' }];
      mockUsersRepository.findAll.mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
      expect(mockUsersRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar um usuário se existir', async () => {
      const user = { _id: '1', email: 'test@test.com' };
      mockUsersRepository.findById.mockResolvedValue(user);

      const result = await service.findOne('1');
      expect(result).toEqual(user);
    });

    it('deve lançar NotFoundException se não existir', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve deletar usuário e limpar cache', async () => {
      mockUsersRepository.delete.mockResolvedValue({ _id: '1' });

      await service.remove('1');
      expect(mockUsersRepository.delete).toHaveBeenCalledWith('1');
      expect(mockCacheManager.clear).toHaveBeenCalled();
    });
  });
});
