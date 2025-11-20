import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from './users.service';
import { User, UserDocument } from './schemas/user.schema';

type MockUserModel = {
  (data: User): UserDocument;
  findOne: jest.Mock;
};

describe('UsersService', () => {
  let service: UsersService;

  const mockUser: User = {
    email: 'test@example.com',
    password: 'hashedPassword123',
  };

  const mockUserDocument = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    password: 'hashedPassword123',
    save: jest.fn().mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      password: 'hashedPassword123',
    }),
  } as unknown as UserDocument;

  const mockUserModelConstructor = jest.fn((data: User) => {
    void data;
    return mockUserDocument;
  }) as unknown as MockUserModel;

  mockUserModelConstructor.findOne = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModelConstructor,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const saveSpy = jest
        .spyOn(mockUserDocument, 'save')
        .mockResolvedValue(mockUserDocument);

      const result = await service.create(mockUser);

      expect(mockUserModelConstructor).toHaveBeenCalledWith(mockUser);
      expect(saveSpy).toHaveBeenCalled();
      expect(result).toEqual(mockUserDocument);

      saveSpy.mockRestore();
    });

    it('should save user with correct data', async () => {
      const saveSpy = jest
        .spyOn(mockUserDocument, 'save')
        .mockResolvedValue(mockUserDocument);

      await service.create(mockUser);

      expect(mockUserModelConstructor).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'hashedPassword123',
      });

      saveSpy.mockRestore();
    });
  });

  describe('findOne', () => {
    it('should find a user by email', async () => {
      const execMock = jest
        .fn<Promise<UserDocument | null>, []>()
        .mockResolvedValue(mockUserDocument);
      mockUserModelConstructor.findOne.mockReturnValue({
        exec: execMock,
      } as unknown as ReturnType<Model<UserDocument>['findOne']>);

      const result = await service.findOne('test@example.com');

      expect(mockUserModelConstructor.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(execMock).toHaveBeenCalled();
      expect(result).toEqual(mockUserDocument);
    });

    it('should return null when user is not found', async () => {
      const execMock = jest
        .fn<Promise<UserDocument | null>, []>()
        .mockResolvedValue(null);
      mockUserModelConstructor.findOne.mockReturnValue({
        exec: execMock,
      } as unknown as ReturnType<Model<UserDocument>['findOne']>);

      const result = await service.findOne('nonexistent@example.com');

      expect(mockUserModelConstructor.findOne).toHaveBeenCalledWith({
        email: 'nonexistent@example.com',
      });
      expect(execMock).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});
