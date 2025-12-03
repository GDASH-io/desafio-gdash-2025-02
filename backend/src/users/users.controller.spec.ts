import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    changePassword: jest.fn(),
    updateTheme: jest.fn(),
    getTheme: jest.fn(),
  };

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

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      const mockUser = { ...createUserDto, _id: '123', role: 'user' };
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [{ _id: '1', email: 'test@example.com' }];
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const mockUser = { _id: '123', email: 'test@example.com' };
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('123');

      expect(service.findOne).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };
      const mockUser = { _id: '123', ...updateUserDto };
      mockUsersService.update.mockResolvedValue(mockUser);

      const result = await controller.update('123', updateUserDto);

      expect(service.update).toHaveBeenCalledWith('123', updateUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      mockUsersService.remove.mockResolvedValue(undefined);

      await controller.remove('123');

      expect(service.remove).toHaveBeenCalledWith('123');
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const changePasswordDto: ChangePasswordDto = {
        password: 'NewPassword123!',
      };
      mockUsersService.changePassword.mockResolvedValue(undefined);

      await controller.changePassword('123', changePasswordDto);

      expect(service.changePassword).toHaveBeenCalledWith('123', changePasswordDto);
    });
  });

  describe('updateTheme', () => {
    it('should update user theme', async () => {
      const updateThemeDto = { theme: 'dark' as const };
      const mockUser = { _id: '123', theme: 'dark' };
      mockUsersService.updateTheme.mockResolvedValue(mockUser);

      const req = {
        user: { _id: '123', role: 'user' },
      };

      const result = await controller.updateTheme('123', updateThemeDto, req);

      expect(service.updateTheme).toHaveBeenCalledWith('123', 'dark');
      expect(result).toEqual({ theme: 'dark' });
    });

    it('should allow admin to update any user theme', async () => {
      const updateThemeDto = { theme: 'light' as const };
      const mockUser = { _id: '456', theme: 'light' };
      mockUsersService.updateTheme.mockResolvedValue(mockUser);

      const req = {
        user: { _id: '123', role: 'admin' },
      };

      const result = await controller.updateTheme('456', updateThemeDto, req);

      expect(service.updateTheme).toHaveBeenCalledWith('456', 'light');
      expect(result).toEqual({ theme: 'light' });
    });
  });

  describe('getTheme', () => {
    it('should get user theme', async () => {
      mockUsersService.getTheme.mockResolvedValue({ theme: 'dark' });

      const req = {
        user: { _id: '123', role: 'user' },
      };

      const result = await controller.getTheme('123', req);

      expect(service.getTheme).toHaveBeenCalledWith('123');
      expect(result).toEqual({ theme: 'dark' });
    });
  });
});

