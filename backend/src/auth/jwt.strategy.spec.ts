import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/domain/user.entity';

const mockConfigService = {
  get: jest.fn(),
};

const mockUsersService = {
  findOne: jest.fn(),
};

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: UsersService;

  beforeEach(async () => {
    mockConfigService.get.mockReturnValue('test-secret');
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user object from JWT payload', async () => {
      const payload = { sub: '123', email: 'test@example.com' };
      const user = new UserEntity('test@example.com', 'hashed', '123');
      
      mockUsersService.findOne.mockResolvedValue(user);

      const result = await strategy.validate(payload);

      expect(result).toEqual({ userId: '123', email: 'test@example.com' });
    });

    it('should handle user not found', async () => {
      const payload = { sub: '123', email: 'nonexistent@example.com' };
      
      mockUsersService.findOne.mockResolvedValue(null);

      const result = await strategy.validate(payload);

      expect(result).toEqual({ userId: '123', email: 'nonexistent@example.com' });
    });

    it('should extract id and email from payload', async () => {
      const payload = { sub: 'user-id-456', email: 'user@example.com' };
      
      mockUsersService.findOne.mockResolvedValue(null);

      const result = await strategy.validate(payload);

      expect(result.userId).toBe('user-id-456');
      expect(result.email).toBe('user@example.com');
    });
  });
});
