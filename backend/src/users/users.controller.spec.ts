import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { hashPassword } from '../utils/hash-password';
import { User, UserDocument } from './schemas/user.schema';

jest.mock('../utils/hash-password');

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  const mockUser: User = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockUserDocument: UserDocument = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    password: 'hashedPassword123',
    save: jest.fn(),
  } as unknown as UserDocument;

  beforeEach(async () => {
    const mockUsersService = {
      create: jest.fn(),
      findOne: jest.fn(),
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

  describe('create', () => {
    it('should create a user successfully', async () => {
      usersService.findOne.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUserDocument);

      const result = await controller.create(mockUser);

      expect(hashPassword).toHaveBeenCalledWith('password123');
      expect(usersService.findOne).toHaveBeenCalledWith('test@example.com');
      expect(usersService.create).toHaveBeenCalledWith({
        ...mockUser,
        password: 'hashedPassword123',
      });
      expect(result).toEqual(mockUserDocument);
    });

    it('should throw BadRequestException when email is invalid', async () => {
      const invalidUser = {
        email: 'invalid-email',
        password: 'password123',
      };

      await expect(() => controller.create(invalidUser)).rejects.toThrow(
        BadRequestException,
      );

      expect(usersService.findOne).not.toHaveBeenCalled();
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when password is too short', async () => {
      const invalidUser = {
        email: 'test@example.com',
        password: '12345',
      };

      await expect(() => controller.create(invalidUser)).rejects.toThrow(
        BadRequestException,
      );

      expect(usersService.findOne).not.toHaveBeenCalled();
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when user already exists', async () => {
      usersService.findOne.mockResolvedValue(mockUserDocument);

      await expect(() => controller.create(mockUser)).rejects.toThrow(
        BadRequestException,
      );
      await expect(() => controller.create(mockUser)).rejects.toThrow(
        'User already exists',
      );

      expect(usersService.findOne).toHaveBeenCalledWith('test@example.com');
      expect(usersService.create).not.toHaveBeenCalled();
      expect(hashPassword).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when multiple validation errors occur', async () => {
      const invalidUser = {
        email: 'invalid-email',
        password: '123',
      };

      await expect(() => controller.create(invalidUser)).rejects.toThrow(
        BadRequestException,
      );

      expect(usersService.findOne).not.toHaveBeenCalled();
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });
});
