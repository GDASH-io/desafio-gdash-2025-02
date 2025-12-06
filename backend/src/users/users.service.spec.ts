import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let userModel: any;

  // Mock do MongoDB Model
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed_password',
    save: jest.fn().mockResolvedValue(this),
  };

  const mockUserModel: any = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: jest.fn().mockResolvedValue({
      _id: '123',
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  }));
  
  Object.assign(mockUserModel, {
    findOne: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    
    // Reset mock methods
    mockUserModel.findOne.mockReset();
    mockUserModel.find.mockReset();
    mockUserModel.findById.mockReset();
    mockUserModel.findByIdAndUpdate.mockReset();
    mockUserModel.deleteOne.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get(getModelToken(User.name));
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
  // TESTE 2: Criar usuário com sucesso
  // ==========================================
  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        password: '123456',
        name: 'New User',
      };

      // Mock: email não existe
      mockUserModel.findOne.mockResolvedValue(null);

      // Mock: bcrypt hash
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password_123');

      const result = await service.create(createUserDto);

      // Verificações
      expect(userModel.findOne).toHaveBeenCalledWith({ email: createUserDto.email });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(result.email).toBe(createUserDto.email);
    });

    // ==========================================
    // TESTE 3: Rejeitar email duplicado
    // ==========================================
    it('should throw ConflictException if email already exists', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        password: '123456',
        name: 'Test User',
      };

      // Mock: email já existe
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      // Verificar se lança exceção
      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ==========================================
  // TESTE 4: Listar todos usuários
  // ==========================================
  describe('findAll', () => {
    it('should return an array of users without passwords', async () => {
      const users = [
        { _id: '1', email: 'user1@test.com', name: 'User 1' },
        { _id: '2', email: 'user2@test.com', name: 'User 2' },
      ];

      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(users),
        }),
      });

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(mockUserModel.find).toHaveBeenCalled();
    });
  });

  // ==========================================
  // TESTE 5: Buscar usuário por ID
  // ==========================================
  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = {
        _id: '123',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(user),
        }),
      });

      const result = await service.findOne('123');

      expect(result).toEqual(user);
      expect(mockUserModel.findById).toHaveBeenCalledWith('123');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  // ==========================================
  // TESTE 6: Buscar por email
  // ==========================================
  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });
});