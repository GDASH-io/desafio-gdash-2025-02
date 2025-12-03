import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import mongoose from 'mongoose';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoose.connection.close();
  });

  describe('Health Check', () => {
    it('/health (GET) should return status ok', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
        });
    });
  });

  describe('Auth', () => {
    const testUser = {
      name: 'E2E Test User',
      email: `e2e-${Date.now()}@test.com`,
      password: 'password123',
    };

    it('/auth/register (POST) should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe(testUser.email);
          authToken = res.body.access_token;
          userId = res.body.user.id;
        });
    });

    it('/auth/login (POST) should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          authToken = res.body.access_token;
        });
    });

    it('/auth/login (POST) should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('Weather Logs', () => {
    const testWeatherLog = {
      timestamp: new Date().toISOString(),
      temperature: 25.5,
      humidity: 70,
      city: 'São Paulo',
    };

    it('/weather/logs (POST) should create a weather log', () => {
      return request(app.getHttpServer())
        .post('/weather/logs')
        .send(testWeatherLog)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id');
          expect(res.body.temperature).toBe(testWeatherLog.temperature);
          expect(res.body.humidity).toBe(testWeatherLog.humidity);
        });
    });

    it('/weather/logs (GET) should return paginated weather logs', () => {
      return request(app.getHttpServer())
        .get('/weather/logs')
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('page', 1);
          expect(res.body).toHaveProperty('limit', 10);
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('/weather/logs (GET) should filter by city', () => {
      return request(app.getHttpServer())
        .get('/weather/logs')
        .query({ page: 1, limit: 10, city: 'São Paulo' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          if (res.body.data.length > 0) {
            expect(res.body.data[0].city).toContain('São Paulo');
          }
        });
    });

    it('/weather/logs (POST) should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/weather/logs')
        .send({
          temperature: 25.5,
          // missing timestamp and humidity
        })
        .expect(400);
    });

    it('/weather/export.csv (GET) should export CSV', () => {
      return request(app.getHttpServer())
        .get('/weather/export.csv')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect('Content-Type', /text\/csv/)
        .expect((res) => {
          expect(res.text).toContain('timestamp,temperature,humidity,city');
        });
    });

    it('/weather/insights (GET) should return insights', () => {
      return request(app.getHttpServer())
        .get('/weather/insights')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('summary');
          expect(res.body).toHaveProperty('statistics');
          expect(res.body).toHaveProperty('comfortScore');
        });
    });
  });

  describe('Users', () => {
    it('/users (GET) should return list of users', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('/users (GET) should require authentication', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(401);
    });
  });
});

