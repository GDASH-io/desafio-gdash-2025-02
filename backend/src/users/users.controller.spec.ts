import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { BadRequestException } from '@nestjs/common';
import { UserEntity } from './domain/user.entity';
import { left, right } from '../shared/core/either';

const mockUsersService = {
  create: jest.fn(),
  findAll: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
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
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const dto = { email: 'test@example.com', password: 'password' };
      const user = new UserEntity(dto.email, 'hashed', '1');
      
      mockUsersService.create.mockResolvedValue(right(user));

      const result = await controller.create(dto);

      expect(result).toBeDefined();
      expect(result.email).toBe(dto.email);
      expect(result.password).toBeUndefined();
    });

    it('should throw BadRequestException when user already exists', async () => {
      const dto = { email: 'existing@example.com', password: 'password' };
      
      mockUsersService.create.mockResolvedValue(left(new Error('User already exists')));

      await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return array of users', async () => {
      const users = [
        new UserEntity('user1@example.com', 'hash1', '1'),
        new UserEntity('user2@example.com', 'hash2', '2'),
      ];
      
      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result).toEqual(users);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no users', async () => {
      mockUsersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });
});
