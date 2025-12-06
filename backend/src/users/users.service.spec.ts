import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { IUsersRepository } from './domain/users.repository.interface';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from './domain/user.entity';
import { left, right } from '../shared/core/either';

const mockUsersRepository = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findAll: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let repository: IUsersRepository;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: IUsersRepository,
          useValue: mockUsersRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<IUsersRepository>(IUsersRepository);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const dto = { email: 'test@example.com', password: 'password' };
      const user = new UserEntity(dto.email, 'hashed', '1');
      
      mockUsersRepository.findByEmail.mockResolvedValue(null);
      mockUsersRepository.create.mockResolvedValue(user);

      const result = await service.create(dto);

      expect(result.isRight()).toBe(true);
      expect(result.value).toBeInstanceOf(UserEntity);
    });

    it('should return Left when user already exists', async () => {
      const dto = { email: 'existing@example.com', password: 'password' };
      const existingUser = new UserEntity(dto.email, 'hashed', '1');
      
      mockUsersRepository.findByEmail.mockResolvedValue(existingUser);

      const result = await service.create(dto);

      expect(result.isLeft()).toBe(true);
      expect(result.value).toBeInstanceOf(Error);
      expect(result.value.message).toContain('already exists');
    });

    it('should hash password before creating user', async () => {
      const dto = { email: 'test@example.com', password: 'plaintext' };
      
      mockUsersRepository.findByEmail.mockResolvedValue(null);
      mockUsersRepository.create.mockResolvedValue(new UserEntity(dto.email, 'hashed', '1'));

      await service.create(dto);

      expect(mockUsersRepository.create).toHaveBeenCalled();
      const createCall = mockUsersRepository.create.mock.calls[0][0];
      expect(createCall.password).not.toBe('plaintext');
    });

    it('should handle empty email', async () => {
      const dto = { email: '', password: 'password' };
      
      mockUsersRepository.findByEmail.mockResolvedValue(null);

      const result = await service.create(dto);

      expect(mockUsersRepository.create).toHaveBeenCalled();
    });

    it('should handle very long password', async () => {
      const dto = { email: 'test@example.com', password: 'a'.repeat(1000) };
      
      mockUsersRepository.findByEmail.mockResolvedValue(null);
      mockUsersRepository.create.mockResolvedValue(new UserEntity(dto.email, 'hashed', '1'));

      const result = await service.create(dto);

      expect(result.isRight()).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return user when found', async () => {
      const user = new UserEntity('test@example.com', 'hashed', '1');
      mockUsersRepository.findByEmail.mockResolvedValue(user);

      const result = await service.findOne('test@example.com');

      expect(result).toEqual(user);
    });

    it('should return null when user not found', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(null);

      const result = await service.findOne('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('should handle special characters in email', async () => {
      const email = 'test+tag@example.com';
      mockUsersRepository.findByEmail.mockResolvedValue(null);

      await service.findOne(email);

      expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('findAll', () => {
    it('should return array of users', async () => {
      const users = [
        new UserEntity('user1@example.com', 'hash1', '1'),
        new UserEntity('user2@example.com', 'hash2', '2'),
      ];
      mockUsersRepository.findAll.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no users', async () => {
      mockUsersRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should handle large number of users', async () => {
      const users = Array.from({ length: 1000 }, (_, i) => 
        new UserEntity(`user${i}@example.com`, 'hash', `${i}`)
      );
      mockUsersRepository.findAll.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toHaveLength(1000);
    });
  });

  describe('onModuleInit', () => {
    it('should skip default user creation when password not set', async () => {
      mockConfigService.get.mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'DEFAULT_ADMIN_EMAIL') return 'admin@example.com';
        if (key === 'DEFAULT_ADMIN_PASSWORD') return undefined;
        return defaultValue;
      });

      await service.onModuleInit();

      expect(mockUsersRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('should create default user when not exists', async () => {
      mockConfigService.get.mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'DEFAULT_ADMIN_EMAIL') return 'admin@example.com';
        if (key === 'DEFAULT_ADMIN_PASSWORD') return 'password123';
        return defaultValue;
      });
      mockUsersRepository.findByEmail.mockResolvedValue(null);
      mockUsersRepository.create.mockResolvedValue(new UserEntity('admin@example.com', 'hashed', '1'));

      await service.onModuleInit();

      expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith('admin@example.com');
      expect(mockUsersRepository.create).toHaveBeenCalled();
    });

    it('should not create default user when already exists', async () => {
      mockConfigService.get.mockImplementation((key: string, defaultValue?: any) => {
        if (key === 'DEFAULT_ADMIN_EMAIL') return 'admin@example.com';
        if (key === 'DEFAULT_ADMIN_PASSWORD') return 'password123';
        return defaultValue;
      });
      mockUsersRepository.findByEmail.mockResolvedValue(new UserEntity('admin@example.com', 'hashed', '1'));

      await service.onModuleInit();

      expect(mockUsersRepository.create).not.toHaveBeenCalled();
    });
  });
});
