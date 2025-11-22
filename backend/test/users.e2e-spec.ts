import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from './../src/app.module';
import { AuthService } from './../src/auth/auth.service';
import { UsersService } from './../src/users/users.service';

import * as request from 'supertest';

describe('Users & Auth Controller (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const mockUsersService = {
    create: jest.fn().mockResolvedValue({
      _id: 'id_novo_usuario',
      email: 'novo@teste.com',
      name: 'Novo Usuário',
    }),
    update: jest.fn().mockResolvedValue({ name: 'Updated Name' }),
    remove: jest.fn().mockResolvedValue({ _id: 'deleted' }),
    findOne: jest.fn().mockResolvedValue({
      _id: 'id_mock',
      email: 'admin@example.com',
      password: 'hashed_password',
    }),
  };

  const mockAuthService = {
    validateUser: jest.fn().mockResolvedValue({
      _id: 'id_mock',
      email: 'admin@example.com',
    }),
    login: jest.fn().mockReturnValue({
      access_token: 'token_falso_gerado_pelo_mock',
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe());

    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();
  });

  describe('Auth (Público)', () => {
    it('/api/users (POST) - Deve criar usuário sem token', () => {
      return request(app.getHttpServer())
        .post('/api/users')
        .send({ email: 'novo@teste.com', password: '123', name: 'Novo' })
        .expect(201)
        .expect((res) => {
          expect(res.body.email).toBe('novo@teste.com');
        });
    });

    it('/api/auth/login (POST) - Deve retornar token', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'admin@example.com', password: '123' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
        });
    });
  });

  describe('Rotas Protegidas (Segurança)', () => {
    let validToken: string;

    beforeAll(() => {
      validToken = jwtService.sign(
        { sub: 'id_mock', email: 'admin@example.com' },
        { secret: 'SEGREDO_SUPER_SECRETO_GDASH' },
      );
    });

    it('/api/users/profile (GET) - Deve bloquear sem token (401)', () => {
      return request(app.getHttpServer()).get('/api/users/profile').expect(401);
    });

    it('/api/users/profile (GET) - Deve liberar com token válido', () => {
      return request(app.getHttpServer())
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.userId).toBe('id_mock');
          expect(res.body.email).toBe('admin@example.com');
        });
    });

    it('/api/users/profile (PUT) - Deve atualizar perfil', () => {
      return request(app.getHttpServer())
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ name: 'New Name' })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Name');
        });
    });

    it('/api/users/profile (DELETE) - Deve deletar conta', () => {
      return request(app.getHttpServer())
        .delete('/api/users/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
