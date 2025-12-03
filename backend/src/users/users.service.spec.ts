import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<UserDocument>;

  // Mock do Model como função construtora
  const MockUserModel: any = jest.fn().mockImplementation((dto) => {
    return {
      ...dto,
      _id: '507f1f77bcf86cd799439011',
      save: jest.fn().mockResolvedValue({
        ...dto,
        _id: '507f1f77bcf86cd799439011',
        toObject: jest.fn().mockReturnValue({
          ...dto,
          _id: '507f1f77bcf86cd799439011',
        }),
      }),
    };
  });

  // Adicionar métodos estáticos ao mock
  MockUserModel.findOne = jest.fn();
  MockUserModel.find = jest.fn();
  MockUserModel.findById = jest.fn();
  MockUserModel.findByIdAndUpdate = jest.fn();
  MockUserModel.findByIdAndDelete = jest.fn();
  MockUserModel.countDocuments = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: MockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<UserDocument>>(getModelToken(User.name));

    jest.clearAllMocks();
    jest.restoreAllMocks();
    MockUserModel.findOne.mockClear();
    MockUserModel.find.mockClear();
    MockUserModel.findById.mockClear();
    MockUserModel.findByIdAndUpdate.mockClear();
    MockUserModel.findByIdAndDelete.mockClear();
    MockUserModel.countDocuments.mockClear();
    MockUserModel.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
      };

      const hashedPassword = 'hashedPassword123';
      const savedUser = {
        _id: '507f1f77bcf86cd799439011',
        ...createUserDto,
        password: hashedPassword,
        toObject: jest.fn().mockReturnValue({
          _id: '507f1f77bcf86cd799439011',
          ...createUserDto,
          password: hashedPassword,
        }),
        save: jest.fn().mockResolvedValue(true),
      };

      MockUserModel.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await service.create(createUserDto);

      expect(MockUserModel.findOne).toHaveBeenCalledWith({ email: createUserDto.email });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password');
    });

    it('should throw HttpException when email already exists', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const existingUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
      };

      MockUserModel.findOne.mockResolvedValue(existingUser);

      await expect(service.create(createUserDto)).rejects.toThrow(HttpException);
    });
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      const mockUsers = [
        {
          _id: '1',
          name: 'User 1',
          email: 'user1@example.com',
          role: 'user',
          toObject: jest.fn().mockReturnValue({
            _id: '1',
            name: 'User 1',
            email: 'user1@example.com',
            role: 'user',
            password: 'hashed1',
          }),
        },
        {
          _id: '2',
          name: 'User 2',
          email: 'user2@example.com',
          role: 'admin',
          toObject: jest.fn().mockReturnValue({
            _id: '2',
            name: 'User 2',
            email: 'user2@example.com',
            role: 'admin',
            password: 'hashed2',
          }),
        },
      ];

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockUsers),
      };

      MockUserModel.find.mockReturnValue(mockQuery);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[1]).not.toHaveProperty('password');
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const mockUser = {
        _id: userId,
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        toObject: jest.fn().mockReturnValue({
          _id: userId,
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          password: 'hashed',
        }),
      };

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockUser),
      };

      MockUserModel.findById.mockReturnValue(mockQuery);

      const result = await service.findOne(userId);

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password');
      expect((result as any)._id).toBe(userId);
    });

    it('should throw HttpException when user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(null),
      };

      MockUserModel.findById.mockReturnValue(mockQuery);

      await expect(service.findOne(userId)).rejects.toThrow(HttpException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const email = 'test@example.com';
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email,
        name: 'Test User',
      };

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockUser),
      };

      MockUserModel.findOne.mockReturnValue(mockQuery);

      const result = await service.findByEmail(email);

      expect(MockUserModel.findOne).toHaveBeenCalledWith({ email });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      const email = 'test@example.com';

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(null),
      };

      MockUserModel.findOne.mockReturnValue(mockQuery);

      const result = await service.findByEmail(email);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const existingUser = {
        _id: userId,
        name: 'Test User',
        email: 'test@example.com',
      };

      const updatedUser = {
        _id: userId,
        ...updateUserDto,
        email: 'test@example.com',
        toObject: jest.fn().mockReturnValue({
          _id: userId,
          ...updateUserDto,
          email: 'test@example.com',
          password: 'hashed',
        }),
      };

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(existingUser),
      };

      MockUserModel.findById.mockReturnValue(mockQuery);

      const mockUpdateQuery = {
        exec: jest.fn().mockResolvedValue(updatedUser),
      };

      MockUserModel.findByIdAndUpdate.mockReturnValue(mockUpdateQuery);

      const result = await service.update(userId, updateUserDto);

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password');
      expect(result.name).toBe(updateUserDto.name);
    });

    it('should update user without password', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const existingUser = {
        _id: userId,
        name: 'Test User',
        email: 'test@example.com',
      };

      const updatedUser = {
        _id: userId,
        ...existingUser,
        name: 'Updated Name',
        toObject: jest.fn().mockReturnValue({
          _id: userId,
          ...existingUser,
          name: 'Updated Name',
        }),
      };

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(existingUser),
      };

      MockUserModel.findById.mockReturnValue(mockQuery);

      const mockUpdateQuery = {
        exec: jest.fn().mockResolvedValue(updatedUser),
      };

      MockUserModel.findByIdAndUpdate.mockReturnValue(mockUpdateQuery);

      const result = await service.update(userId, updateUserDto);

      expect(result).toBeDefined();
      expect(MockUserModel.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('should throw HttpException when user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(null),
      };

      MockUserModel.findById.mockReturnValue(mockQuery);

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(HttpException);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const mockUser = {
        _id: userId,
        name: 'Test User',
        email: 'test@example.com',
      };

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockUser),
      };

      MockUserModel.findById.mockReturnValue(mockQuery);

      const mockDeleteQuery = {
        exec: jest.fn().mockResolvedValue(mockUser),
      };

      MockUserModel.findByIdAndDelete.mockReturnValue(mockDeleteQuery);

      await service.remove(userId);

      expect(MockUserModel.findByIdAndDelete).toHaveBeenCalledWith(userId);
    });

    it('should throw HttpException when user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(null),
      };

      MockUserModel.findById.mockReturnValue(mockQuery);

      await expect(service.remove(userId)).rejects.toThrow(HttpException);
    });

    it('should throw HttpException when trying to delete last admin', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const mockUser = {
        _id: userId,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
      };

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockUser),
      };

      const mockCountQuery = {
        exec: jest.fn().mockResolvedValue(1),
      };

      MockUserModel.findById.mockReturnValue(mockQuery);
      MockUserModel.countDocuments.mockReturnValue(mockCountQuery);

      await expect(service.remove(userId)).rejects.toThrow(HttpException);
      await expect(service.remove(userId)).rejects.toThrow('último administrador');
    });

    it('should allow deleting admin when there are multiple admins', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const mockUser = {
        _id: userId,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
      };

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockUser),
      };

      const mockCountQuery = {
        exec: jest.fn().mockResolvedValue(2),
      };

      MockUserModel.findById.mockReturnValue(mockQuery);
      MockUserModel.countDocuments.mockReturnValue(mockCountQuery);

      const mockDeleteQuery = {
        exec: jest.fn().mockResolvedValue(mockUser),
      };

      MockUserModel.findByIdAndDelete.mockReturnValue(mockDeleteQuery);

      await service.remove(userId);

      expect(MockUserModel.findByIdAndDelete).toHaveBeenCalledWith(userId);
    });
  });

  describe('update', () => {
    it('should throw HttpException when trying to change last admin role', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updateUserDto: UpdateUserDto = {
        role: 'user',
      };

      const existingUser = {
        _id: userId,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
      };

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(existingUser),
      };

      const mockCountQuery = {
        exec: jest.fn().mockResolvedValue(1),
      };

      MockUserModel.findById.mockReturnValue(mockQuery);
      MockUserModel.countDocuments.mockReturnValue(mockCountQuery);

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(HttpException);
      await expect(service.update(userId, updateUserDto)).rejects.toThrow('último administrador');
    });

    it('should allow changing admin role when there are multiple admins', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updateUserDto: UpdateUserDto = {
        role: 'user',
      };

      const existingUser = {
        _id: userId,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
      };

      const updatedUser = {
        _id: userId,
        ...updateUserDto,
        email: 'admin@example.com',
        toObject: jest.fn().mockReturnValue({
          _id: userId,
          ...updateUserDto,
          email: 'admin@example.com',
        }),
      };

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(existingUser),
      };

      const mockCountQuery = {
        exec: jest.fn().mockResolvedValue(2),
      };

      MockUserModel.findById.mockReturnValue(mockQuery);
      MockUserModel.countDocuments.mockReturnValue(mockCountQuery);

      const mockUpdateQuery = {
        exec: jest.fn().mockResolvedValue(updatedUser),
      };

      MockUserModel.findByIdAndUpdate.mockReturnValue(mockUpdateQuery);

      const result = await service.update(userId, updateUserDto);

      expect(result.role).toBe('user');
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const changePasswordDto = {
        password: 'newPassword123',
      };

      const mockUser = {
        _id: userId,
        name: 'Test User',
        email: 'test@example.com',
      };

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(mockUser),
      };

      MockUserModel.findById.mockReturnValue(mockQuery);
      MockUserModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');

      await service.changePassword(userId, changePasswordDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(changePasswordDto.password, 10);
      expect(MockUserModel.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('should throw HttpException when user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const changePasswordDto = {
        password: 'newPassword123',
      };

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(null),
      };

      MockUserModel.findById.mockReturnValue(mockQuery);

      await expect(service.changePassword(userId, changePasswordDto)).rejects.toThrow(HttpException);
    });
  });

  describe('count and countAdmins', () => {
    it('should count all users', async () => {
      const mockCountQuery = {
        exec: jest.fn().mockResolvedValue(5),
      };

      MockUserModel.countDocuments.mockReturnValue(mockCountQuery);

      const result = await service.count();

      expect(result).toBe(5);
      expect(MockUserModel.countDocuments).toHaveBeenCalledWith();
    });

    it('should count admin users', async () => {
      const mockCountQuery = {
        exec: jest.fn().mockResolvedValue(2),
      };

      MockUserModel.countDocuments.mockReturnValue(mockCountQuery);

      const result = await service.countAdmins();

      expect(result).toBe(2);
      expect(MockUserModel.countDocuments).toHaveBeenCalledWith({ role: 'admin' });
    });
  });

  describe('updateTheme', () => {
    it('should update user theme', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const theme = 'dark';

      const existingUser = {
        _id: userId,
        name: 'Test User',
        email: 'test@example.com',
      };

      const updatedUser = {
        _id: userId,
        ...existingUser,
        theme,
        toObject: jest.fn().mockReturnValue({
          _id: userId,
          ...existingUser,
          theme,
        }),
      };

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(existingUser),
      };

      const mockUpdateQuery = {
        exec: jest.fn().mockResolvedValue(updatedUser),
      };

      MockUserModel.findById.mockReturnValue(mockQuery);
      MockUserModel.findByIdAndUpdate.mockReturnValue(mockUpdateQuery);

      const result = await service.updateTheme(userId, theme);

      expect(MockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(MockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { theme },
        { new: true }
      );
      expect(result).toBeDefined();
      expect(result.theme).toBe(theme);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw HttpException when user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const theme = 'dark';

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(null),
      };

      MockUserModel.findById.mockReturnValue(mockQuery);

      await expect(service.updateTheme(userId, theme)).rejects.toThrow(HttpException);
      await expect(service.updateTheme(userId, theme)).rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('getTheme', () => {
    it('should get user theme', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const mockUser = {
        _id: userId,
        theme: 'dark',
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      };

      MockUserModel.findById = jest.fn().mockReturnValue(mockQuery);

      const result = await service.getTheme(userId);

      expect(MockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ theme: 'dark' });
    });

    it('should return null when theme is not set', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const mockUser = {
        _id: userId,
        theme: undefined,
      };

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      };

      MockUserModel.findById = jest.fn().mockReturnValue(mockQuery);

      const result = await service.getTheme(userId);

      expect(result).toEqual({ theme: null });
    });

    it('should throw HttpException when user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      MockUserModel.findById = jest.fn().mockReturnValue(mockQuery);

      await expect(service.getTheme(userId)).rejects.toThrow(HttpException);
      await expect(service.getTheme(userId)).rejects.toThrow('Usuário não encontrado');
    });
  });
});

