import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { User } from './schemas/user.schema';
import { UsersService } from './users.service';

import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let model: any;

  const mockUserModel = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockUserConstructor = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: jest.fn().mockResolvedValue({ _id: '1', ...dto }),
  }));
  Object.assign(mockUserConstructor, mockUserModel);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: mockUserConstructor },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get(getModelToken(User.name));

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criptografar a senha antes de salvar', async () => {
      const hashSpy = jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => 'hashed_pass');

      await service.create('test@test.com', '123', 'Test');

      expect(hashSpy).toHaveBeenCalled();
      expect(mockUserConstructor).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'hashed_pass',
        }),
      );
    });
  });

  describe('onModuleInit (Seed)', () => {
    it('deve criar admin se não existir', async () => {
      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValue({} as any);

      await service.onModuleInit();

      expect(createSpy).toHaveBeenCalledWith(
        expect.stringContaining('admin@'),
        expect.any(String),
        expect.any(String),
      );
    });

    it('NÃO deve criar admin se já existir', async () => {
      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ email: 'admin@example.com' }),
      });

      const createSpy = jest.spyOn(service, 'create');

      await service.onModuleInit();

      expect(createSpy).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar um usuário quando encontrado pelo email', async () => {
      const mockUser = { email: 'busca@teste.com', name: 'Usuário Encontrado' };

      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findOne('busca@teste.com');

      expect(model.findOne).toHaveBeenCalledWith({ email: 'busca@teste.com' });
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('deve atualizar o usuário e hash a senha se fornecida', async () => {
      const hashSpy = jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => 'new_hashed');
      model.findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ name: 'Updated' }),
      });

      const result = await service.update('id1', {
        name: 'New Name',
        password: 'newpass',
      });

      expect(hashSpy).toHaveBeenCalled();
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'id1',
        expect.objectContaining({ password: 'new_hashed' }),
        { new: true },
      );
      expect(result).toEqual({ name: 'Updated' });
    });
  });

  describe('delete', () => {
    it('deve deletar o usuário', async () => {
      model.findByIdAndDelete = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'deleted' }),
      });

      const result = await service.remove('id1');

      expect(model.findByIdAndDelete).toHaveBeenCalledWith('id1');
      expect(result).toEqual({ _id: 'deleted' });
    });
  });
});
