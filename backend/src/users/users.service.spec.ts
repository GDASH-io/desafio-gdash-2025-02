import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from './users.service';
import { User, UserDocument } from './schemas/user.schema';
import { Role } from './enums/role.enum';

type MockUserModel = {
  (data: User): UserDocument;
  findOne: jest.Mock;
  find: jest.Mock;
  findById: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  findByIdAndDelete: jest.Mock;
};

describe('UsersService', () => {
  let service: UsersService;

  const mockUser: User = {
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: Role.USER,
  };

  const mockUserDocument = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: Role.USER,
    save: jest.fn().mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      password: 'hashedPassword123',
      role: Role.USER,
    }),
  } as unknown as UserDocument;

  const mockUserModelConstructor = jest.fn((data: User) => {
    void data;
    return mockUserDocument;
  }) as unknown as MockUserModel;

  mockUserModelConstructor.findOne = jest.fn();
  mockUserModelConstructor.find = jest.fn();
  mockUserModelConstructor.findById = jest.fn();
  mockUserModelConstructor.findByIdAndUpdate = jest.fn();
  mockUserModelConstructor.findByIdAndDelete = jest.fn();

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

  describe('createUser', () => {
    it('should create a new user', async () => {
      const saveSpy = jest
        .spyOn(mockUserDocument, 'save')
        .mockResolvedValue(mockUserDocument);

      const result = await service.createUser(mockUser);

      expect(mockUserModelConstructor).toHaveBeenCalledWith(mockUser);
      expect(saveSpy).toHaveBeenCalled();
      expect(result).toEqual(mockUserDocument);

      saveSpy.mockRestore();
    });

    it('should save user with correct data', async () => {
      const saveSpy = jest
        .spyOn(mockUserDocument, 'save')
        .mockResolvedValue(mockUserDocument);

      await service.createUser(mockUser);

      expect(mockUserModelConstructor).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'hashedPassword123',
        role: Role.USER,
      });

      saveSpy.mockRestore();
    });
  });

  describe('findUserByEmail', () => {
    it('should find a user by email', async () => {
      const execMock = jest
        .fn<Promise<UserDocument | null>, []>()
        .mockResolvedValue(mockUserDocument);
      mockUserModelConstructor.findOne.mockReturnValue({
        exec: execMock,
      } as unknown as ReturnType<Model<UserDocument>['findOne']>);

      const result = await service.findUserByEmail('test@example.com');

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

      const result = await service.findUserByEmail('nonexistent@example.com');

      expect(mockUserModelConstructor.findOne).toHaveBeenCalledWith({
        email: 'nonexistent@example.com',
      });
      expect(execMock).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('findAllUsers', () => {
    it('should return all users', async () => {
      const mockUsersList = [mockUserDocument];
      const execMock = jest
        .fn<Promise<UserDocument[]>, []>()
        .mockResolvedValue(mockUsersList);
      mockUserModelConstructor.find.mockReturnValue({
        exec: execMock,
      } as unknown as ReturnType<Model<UserDocument>['find']>);

      const result = await service.findAllUsers();

      expect(mockUserModelConstructor.find).toHaveBeenCalledWith();
      expect(execMock).toHaveBeenCalled();
      expect(result).toEqual(mockUsersList);
    });

    it('should return empty array when no users exist', async () => {
      const execMock = jest
        .fn<Promise<UserDocument[]>, []>()
        .mockResolvedValue([]);
      mockUserModelConstructor.find.mockReturnValue({
        exec: execMock,
      } as unknown as ReturnType<Model<UserDocument>['find']>);

      const result = await service.findAllUsers();

      expect(mockUserModelConstructor.find).toHaveBeenCalledWith();
      expect(execMock).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findUserById', () => {
    it('should find a user by id', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const execMock = jest
        .fn<Promise<UserDocument | null>, []>()
        .mockResolvedValue(mockUserDocument);
      mockUserModelConstructor.findById.mockReturnValue({
        exec: execMock,
      } as unknown as ReturnType<Model<UserDocument>['findById']>);

      const result = await service.findUserById(userId);

      expect(mockUserModelConstructor.findById).toHaveBeenCalledWith(userId);
      expect(execMock).toHaveBeenCalled();
      expect(result).toEqual(mockUserDocument);
    });

    it('should return null when user is not found', async () => {
      const userId = '507f1f77bcf86cd799439099';
      const execMock = jest
        .fn<Promise<UserDocument | null>, []>()
        .mockResolvedValue(null);
      mockUserModelConstructor.findById.mockReturnValue({
        exec: execMock,
      } as unknown as ReturnType<Model<UserDocument>['findById']>);

      const result = await service.findUserById(userId);

      expect(mockUserModelConstructor.findById).toHaveBeenCalledWith(userId);
      expect(execMock).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update a user successfully', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updatedUser = {
        ...mockUserDocument,
        email: 'updated@example.com',
      } as UserDocument;
      const execMock = jest
        .fn<Promise<UserDocument | null>, []>()
        .mockResolvedValue(updatedUser);
      mockUserModelConstructor.findByIdAndUpdate.mockReturnValue({
        exec: execMock,
      } as unknown as ReturnType<Model<UserDocument>['findByIdAndUpdate']>);

      const result = await service.updateUser(userId, mockUser);

      expect(mockUserModelConstructor.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        mockUser,
        { new: true },
      );
      expect(execMock).toHaveBeenCalled();
      expect(result).toEqual(updatedUser);
    });

    it('should return null when user is not found', async () => {
      const userId = '507f1f77bcf86cd799439099';
      const execMock = jest
        .fn<Promise<UserDocument | null>, []>()
        .mockResolvedValue(null);
      mockUserModelConstructor.findByIdAndUpdate.mockReturnValue({
        exec: execMock,
      } as unknown as ReturnType<Model<UserDocument>['findByIdAndUpdate']>);

      const result = await service.updateUser(userId, mockUser);

      expect(mockUserModelConstructor.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        mockUser,
        { new: true },
      );
      expect(execMock).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('deleteUser', () => {
    it('should delete a user successfully', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const execMock = jest
        .fn<Promise<UserDocument | null>, []>()
        .mockResolvedValue(mockUserDocument);
      mockUserModelConstructor.findByIdAndDelete.mockReturnValue({
        exec: execMock,
      } as unknown as ReturnType<Model<UserDocument>['findByIdAndDelete']>);

      const result = await service.deleteUser(userId);

      expect(mockUserModelConstructor.findByIdAndDelete).toHaveBeenCalledWith(
        userId,
      );
      expect(execMock).toHaveBeenCalled();
      expect(result).toEqual(mockUserDocument);
    });

    it('should return null when user is not found', async () => {
      const userId = '507f1f77bcf86cd799439099';
      const execMock = jest
        .fn<Promise<UserDocument | null>, []>()
        .mockResolvedValue(null);
      mockUserModelConstructor.findByIdAndDelete.mockReturnValue({
        exec: execMock,
      } as unknown as ReturnType<Model<UserDocument>['findByIdAndDelete']>);

      const result = await service.deleteUser(userId);

      expect(mockUserModelConstructor.findByIdAndDelete).toHaveBeenCalledWith(
        userId,
      );
      expect(execMock).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});
