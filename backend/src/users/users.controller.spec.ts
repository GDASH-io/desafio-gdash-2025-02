import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    create: jest
      .fn()
      .mockResolvedValue({ email: 'test@test.com', name: 'Test' }),
    update: jest
      .fn()
      .mockResolvedValue({ email: 'test@test.com', name: 'Updated' }),
    remove: jest.fn().mockResolvedValue({ _id: 'deleted' }),
    findOne: jest.fn().mockResolvedValue({
      toObject: () => ({
        password: 'hash',
        email: 'test@test.com',
        name: 'Test',
      }),
    }),
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
    usersService = module.get<UsersService>(UsersService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('create() deve chamar usersService.create', async () => {
    const body = { email: 'test@test.com', password: '123', name: 'Test' };
    await controller.create(body);
    expect(usersService.create).toHaveBeenCalledWith(
      body.email,
      body.password,
      body.name,
    );
  });

  it('getProfile() deve buscar o usuário pelo email do token', async () => {
    const req = { user: { email: 'test@test.com' } };
    const result = await controller.getProfile(req);

    expect(usersService.findOne).toHaveBeenCalledWith('test@test.com');
    expect(result).toHaveProperty('email');
    expect(result).not.toHaveProperty('password');
  });

  it('update() deve chamar usersService.update', async () => {
    const req = { user: { userId: '1' } };
    const body = { name: 'Updated' };
    await controller.update(req, body);

    expect(usersService.update).toHaveBeenCalledWith('1', body);
  });

  it('remove() deve chamar usersService.remove', async () => {
    const req = { user: { userId: '1' } };
    await controller.remove(req);

    expect(usersService.remove).toHaveBeenCalledWith('1');
  });

  it('getProfile() deve lançar NotFoundException se o usuário não for encontrado no banco', async () => {
    const req = { user: { email: 'fantasma@teste.com' } };
    (usersService.findOne as jest.Mock).mockResolvedValueOnce(null);
    await expect(controller.getProfile(req)).rejects.toThrow(NotFoundException);
  });
});
