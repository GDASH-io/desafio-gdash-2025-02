import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { hashPassword } from '../utils/hash-password';
import { UserDocument } from './schemas/user.schema';
import { Role } from './enums/role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

jest.mock('../utils/hash-password');

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  const mockUser: CreateUserDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockUserDocument: UserDocument = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: Role.USER,
    save: jest.fn(),
  } as unknown as UserDocument;

  const mockUsersList: UserDocument[] = [
    mockUserDocument,
    {
      _id: '507f1f77bcf86cd799439012',
      email: 'test2@example.com',
      password: 'hashedPassword456',
      role: Role.USER,
    } as unknown as UserDocument,
  ];

  beforeEach(async () => {
    const mockUsersService = {
      createUser: jest.fn(),
      findUserByEmail: jest.fn(),
      findAllUsers: jest.fn(),
      findUsersPaginated: jest.fn(),
      findUserById: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);

    (hashPassword as jest.Mock).mockResolvedValue('hashedPassword123');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      usersService.findUserByEmail.mockResolvedValue(null);
      usersService.createUser.mockResolvedValue(mockUserDocument);

      const result = await controller.createUser(mockUser);

      expect(hashPassword).toHaveBeenCalledWith('password123');
      expect(usersService.findUserByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(usersService.createUser).toHaveBeenCalledWith({
        ...mockUser,
        password: 'hashedPassword123',
        role: Role.USER,
      });
      expect(result).toEqual(mockUserDocument);
    });

    it('should throw BadRequestException when email is invalid', async () => {
      const invalidUser = {
        email: 'invalid-email',
        password: 'password123',
      };

      await expect(() => controller.createUser(invalidUser)).rejects.toThrow(
        BadRequestException,
      );

      expect(usersService.findUserByEmail).not.toHaveBeenCalled();
      expect(usersService.createUser).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when password is too short', async () => {
      const invalidUser = {
        email: 'test@example.com',
        password: '12345',
      };

      await expect(() => controller.createUser(invalidUser)).rejects.toThrow(
        BadRequestException,
      );

      expect(usersService.findUserByEmail).not.toHaveBeenCalled();
      expect(usersService.createUser).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when user already exists', async () => {
      usersService.findUserByEmail.mockResolvedValue(mockUserDocument);

      await expect(() => controller.createUser(mockUser)).rejects.toThrow(
        BadRequestException,
      );
      await expect(() => controller.createUser(mockUser)).rejects.toThrow(
        'User already exists',
      );

      expect(usersService.findUserByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(usersService.createUser).not.toHaveBeenCalled();
      expect(hashPassword).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when multiple validation errors occur', async () => {
      const invalidUser = {
        email: 'invalid-email',
        password: '123',
      };

      await expect(() => controller.createUser(invalidUser)).rejects.toThrow(
        BadRequestException,
      );

      expect(usersService.findUserByEmail).not.toHaveBeenCalled();
      expect(usersService.createUser).not.toHaveBeenCalled();
    });
  });

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      const mockPaginatedResponse = {
        data: mockUsersList,
        page: 1,
        itemsPerPage: 10,
        totalPages: 1,
        totalItems: 2,
      };

      usersService.findUsersPaginated.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.getUsers({});

      expect(usersService.findUsersPaginated).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should return paginated users with custom pagination', async () => {
      const mockPaginatedResponse = {
        data: mockUsersList,
        page: 2,
        itemsPerPage: 5,
        totalPages: 1,
        totalItems: 2,
      };

      usersService.findUsersPaginated.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.getUsers({
        page: 2,
        itemsPerPage: 5,
      });

      expect(usersService.findUsersPaginated).toHaveBeenCalledWith(2, 5);
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should throw BadRequestException when page is less than 1', async () => {
      await expect(() => controller.getUsers({ page: 0 })).rejects.toThrow(
        BadRequestException,
      );
      expect(usersService.findUsersPaginated).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when itemsPerPage is less than 1', async () => {
      await expect(() =>
        controller.getUsers({ itemsPerPage: 0 }),
      ).rejects.toThrow(BadRequestException);
      expect(usersService.findUsersPaginated).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return a user by id', async () => {
      const userId = '507f1f77bcf86cd799439011';
      usersService.findUserById.mockResolvedValue(mockUserDocument);

      const result = await controller.getUserById(userId);

      expect(usersService.findUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUserDocument);
    });

    it('should throw NotFoundException when user is not found', async () => {
      const userId = '507f1f77bcf86cd799439099';
      usersService.findUserById.mockResolvedValue(null);

      await expect(() => controller.getUserById(userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(() => controller.getUserById(userId)).rejects.toThrow(
        'User not found',
      );

      expect(usersService.findUserById).toHaveBeenCalledWith(userId);
    });
  });

  describe('updateUser', () => {
    it('should update a user successfully', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updatedUserData: UpdateUserDto = {
        email: 'updated@example.com',
        password: 'newpassword123',
      };
      const updatedUserDocument = {
        ...mockUserDocument,
        email: 'updated@example.com',
      } as UserDocument;

      usersService.updateUser.mockResolvedValue(updatedUserDocument);

      const result = await controller.updateUser(userId, updatedUserData);

      expect(hashPassword).toHaveBeenCalledWith('newpassword123');
      expect(usersService.updateUser).toHaveBeenCalledWith(userId, {
        ...updatedUserData,
        password: 'hashedPassword123',
      });
      expect(result).toEqual(updatedUserDocument);
    });

    it('should throw BadRequestException when validation fails', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const invalidUserData = {
        email: 'invalid-email',
        password: '123',
      };

      await expect(() =>
        controller.updateUser(userId, invalidUserData),
      ).rejects.toThrow(BadRequestException);

      expect(usersService.updateUser).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when user is not found', async () => {
      const userId = '507f1f77bcf86cd799439099';
      usersService.updateUser.mockResolvedValue(null);

      await expect(() =>
        controller.updateUser(userId, mockUser),
      ).rejects.toThrow(NotFoundException);
      await expect(() =>
        controller.updateUser(userId, mockUser),
      ).rejects.toThrow('User not found');

      expect(usersService.updateUser).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should delete a user successfully', async () => {
      const userId = '507f1f77bcf86cd799439011';
      usersService.deleteUser.mockResolvedValue(mockUserDocument);

      const result = await controller.deleteUser(userId);

      expect(usersService.deleteUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ message: 'User deleted successfully' });
    });

    it('should throw NotFoundException when user is not found', async () => {
      const userId = '507f1f77bcf86cd799439099';
      usersService.deleteUser.mockResolvedValue(null);

      await expect(() => controller.deleteUser(userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(() => controller.deleteUser(userId)).rejects.toThrow(
        'User not found',
      );

      expect(usersService.deleteUser).toHaveBeenCalledWith(userId);
    });
  });
});
