import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    create: jest.fn().mockResolvedValue({ email: 'test@test.com' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('create() deve criar um usuário', async () => {
    const body = { email: 'test@test.com', password: '123', name: 'Test' };
    const result = await controller.create(body);

    expect(usersService.create).toHaveBeenCalledWith(
      body.email,
      body.password,
      body.name,
    );
    expect(result).toEqual({ email: 'test@test.com' });
  });

  it('getProfile() deve retornar o usuário do request', () => {
    const req = { user: { userId: '1', email: 'test@test.com' } };
    const result = controller.getProfile(req);
    expect(result).toEqual(req.user);
  });
});
