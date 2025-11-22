import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn().mockReturnValue({ access_token: 'token' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('login() deve retornar o token', async () => {
    const req = { user: { email: 'test@test.com', _id: '1' } };
    const result = await controller.login(req);

    expect(authService.login).toHaveBeenCalledWith(req.user);
    expect(result).toEqual({ access_token: 'token' });
  });
});
