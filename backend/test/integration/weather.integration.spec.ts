import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

describe('Weather Integration (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    connection = moduleFixture.get<Connection>(getConnectionToken());
    await app.init();
  });

  afterAll(async () => {
    await connection.close();
    await app.close();
  });

  describe('/weather/logs (POST)', () => {
    it('should create a weather log', () => {
      return request(app.getHttpServer())
        .post('/weather/logs')
        .send({
          timestamp: '2025-01-24T10:00:00Z',
          temperature: 25.5,
          humidity: 70,
          city: 'São Paulo',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id');
          expect(res.body.temperature).toBe(25.5);
          expect(res.body.humidity).toBe(70);
        });
    });

    it('should reject invalid data', () => {
      return request(app.getHttpServer())
        .post('/weather/logs')
        .send({
          temperature: 'invalid',
          humidity: -10,
        })
        .expect(400);
    });
  });

  describe('/weather/logs (GET)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get('/weather/logs')
        .expect(401);
    });

    // Note: Para testar com autenticação, seria necessário criar um token JWT válido
    // Isso pode ser feito criando um helper de autenticação nos testes
  });

  describe('/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
        });
    });
  });
});

