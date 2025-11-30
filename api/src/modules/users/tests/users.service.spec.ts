import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { commonConstants } from 'src/shared/constants';
import { EncryptService } from '../../encrypt/encrypt.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { InMemoryUserRepository } from '../infraestructure/adapters/inMemory-user.repository';
import { UsersService } from '../users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: InMemoryUserRepository;
  let encryptService: jest.Mocked<EncryptService>;

  beforeEach(async () => {
    const mockEncryptService = {
      encryptPassword: jest.fn(),
      comparePassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: commonConstants.ports.USERS,
          useClass: InMemoryUserRepository,
        },
        {
          provide: EncryptService,
          useValue: mockEncryptService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<InMemoryUserRepository>(
      commonConstants.ports.USERS,
    );
    encryptService = module.get(EncryptService);

    repository.clear();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    it('should create a new user successfully', async () => {
      const hashedPassword = 'hashed_password123';
      encryptService.encryptPassword.mockResolvedValue(hashedPassword);

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(result.name).toBe(createUserDto.name);
      expect(result.email).toBe(createUserDto.email);
      expect(result.password).toBe(hashedPassword);
      expect(encryptService.encryptPassword).toHaveBeenCalledWith(
        createUserDto.password,
      );
    });

    it('should throw ConflictException if user already exists', async () => {
      encryptService.encryptPassword.mockResolvedValue('hashed_password');

      await service.create(createUserDto);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createUserDto)).rejects.toThrow(
        'Usuário já existe',
      );
    });

    it('should hash the password before saving', async () => {
      const hashedPassword = 'super_hashed_password';
      encryptService.encryptPassword.mockResolvedValue(hashedPassword);

      await service.create(createUserDto);

      expect(encryptService.encryptPassword).toHaveBeenCalledTimes(1);
      expect(encryptService.encryptPassword).toHaveBeenCalledWith(
        createUserDto.password,
      );
    });
  });

  describe('findAll', () => {
    it('should return an empty array when no users exist', async () => {
      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return all users', async () => {
      encryptService.encryptPassword.mockResolvedValue('hashed_password');

      await service.create({
        name: 'User 1',
        email: 'user1@example.com',
        password: 'password123',
      });
      await service.create({
        name: 'User 2',
        email: 'user2@example.com',
        password: 'password456',
      });

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('User 1');
      expect(result[1].name).toBe('User 2');
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      encryptService.encryptPassword.mockResolvedValue('hashed_password');

      const createdUser = await service.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      const result = await service.findOne(String(createdUser._id));

      expect(result).toBeDefined();
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Usuário não encontrado',
      );
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      encryptService.encryptPassword.mockResolvedValue('hashed_password');

      const createdUser = await service.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      const updateUserDto: UpdateUserDto = {
        name: 'John Updated',
      };

      const result = await service.update(
        String(createdUser._id),
        updateUserDto,
      );

      expect(result).toBeDefined();
      expect(result.name).toBe('John Updated');
      expect(result.email).toBe('john@example.com');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      await expect(
        service.update('non-existent-id', updateUserDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update('non-existent-id', updateUserDto),
      ).rejects.toThrow('Usuário não encontrado');
    });

    it('should throw ConflictException when email is already in use by another user', async () => {
      encryptService.encryptPassword.mockResolvedValue('hashed_password');

      const user1 = await service.create({
        name: 'User 1',
        email: 'user1@example.com',
        password: 'password123',
      });

      await service.create({
        name: 'User 2',
        email: 'user2@example.com',
        password: 'password456',
      });

      const updateUserDto: UpdateUserDto = {
        email: 'user2@example.com',
      };

      await expect(
        service.update(String(user1._id), updateUserDto),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.update(String(user1._id), updateUserDto),
      ).rejects.toThrow('Email já está em uso');
    });

    it('should allow updating email to the same email', async () => {
      encryptService.encryptPassword.mockResolvedValue('hashed_password');

      const createdUser = await service.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      const updateUserDto: UpdateUserDto = {
        email: 'john@example.com',
        name: 'John Updated',
      };

      const result = await service.update(
        String(createdUser._id),
        updateUserDto,
      );

      expect(result).toBeDefined();
      expect(result.name).toBe('John Updated');
      expect(result.email).toBe('john@example.com');
    });
  });

  describe('remove', () => {
    it('should remove a user successfully', async () => {
      encryptService.encryptPassword.mockResolvedValue('hashed_password');

      const createdUser = await service.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      await service.remove(String(createdUser._id));

      const users = await service.findAll();
      expect(users).toHaveLength(0);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove('non-existent-id')).rejects.toThrow(
        'Usuário não encontrado',
      );
    });

    it('should not affect other users when removing one', async () => {
      encryptService.encryptPassword.mockResolvedValue('hashed_password');

      const user1 = await service.create({
        name: 'User 1',
        email: 'user1@example.com',
        password: 'password123',
      });

      const user2 = await service.create({
        name: 'User 2',
        email: 'user2@example.com',
        password: 'password456',
      });

      await service.remove(String(user1._id));

      const users = await service.findAll();
      expect(users).toHaveLength(1);
      expect(users[0]._id).toEqual(user2._id);
    });
  });
});
