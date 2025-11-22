import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from './../src/app.module';
import { WeatherService } from './../src/weather/weather.service';

import * as request from 'supertest';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  const mockWeatherService = {
    findAll: jest.fn().mockReturnValue([{ temperature: 99, humidity: 99 }]),
    create: jest.fn().mockImplementation((dto) => ({ _id: 'uuid', ...dto })),
    generateCsv: jest.fn().mockResolvedValue('header\ndado'),
    generateXlsx: jest.fn().mockResolvedValue(Buffer.from('fake-excel')),
    generateInsights: jest.fn().mockResolvedValue({
      summary: 'E2E Test AI',
      trend: 'stable',
      averageTemp: 25,
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(WeatherService)
      .useValue(mockWeatherService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('/api/weather/logs (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/weather/logs')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].temperature).toBe(99);
      });
  });

  it('/api/weather/logs (POST)', () => {
    const dto = {
      temperature: 30,
      humidity: 50,
      wind_speed: 12,
      timestamp: '2025-01-01',
    };

    return request(app.getHttpServer())
      .post('/api/weather/logs')
      .send(dto)
      .expect(201)
      .expect((res) => {
        expect(res.body.temperature).toBe(30);
        expect(res.body._id).toBeDefined();
      });
  });

  it('/api/weather/export/csv (GET) - Deve baixar CSV', () => {
    return request(app.getHttpServer())
      .get('/api/weather/export/csv')
      .expect(200)
      .expect('Content-Type', /text\/csv/)
      .expect('Content-Disposition', /attachment/);
  });

  it('/api/weather/export/xlsx (GET) - Deve baixar Excel', () => {
    return request(app.getHttpServer())
      .get('/api/weather/export/xlsx')
      .expect(200)
      .expect('Content-Type', /spreadsheetml/)
      .expect('Content-Disposition', /attachment/);
  });

  it('/api/weather/insights (GET) - Deve retornar IA', () => {
    return request(app.getHttpServer())
      .get('/api/weather/insights')
      .expect(200)
      .expect((res) => {
        expect(res.body.summary).toBe('E2E Test AI');
        expect(res.body.trend).toBe('stable');
      });
  });

  it('/api/weather/logs (POST) - Validação de Erro', () => {
    return request(app.getHttpServer())
      .post('/api/weather/logs')
      .send({ temperature: 'texto-invalido' })
      .expect(400);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Validação de Dados (Edge Cases)', () => {
    it('Deve rejeitar payload vazio (400)', () => {
      return request(app.getHttpServer())
        .post('/api/weather/logs')
        .send({})
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeInstanceOf(Array);
          expect(res.body.error).toBe('Bad Request');
        });
    });

    it('Deve rejeitar tipos de dados incorretos (400)', () => {
      const invalidDto = {
        temperature: 'muito quente',
        humidity: 50,
        wind_speed: 10,
        timestamp: '2025-01-01',
      };

      return request(app.getHttpServer())
        .post('/api/weather/logs')
        .send(invalidDto)
        .expect(400)
        .expect((res) => {
          expect(JSON.stringify(res.body.message)).toContain(
            'temperature must be a number',
          );
        });
    });

    it('Deve rejeitar se faltar um campo obrigatório (wind_speed)', () => {
      const incompleteDto = {
        temperature: 25,
        humidity: 50,
        timestamp: '2025-01-01',
      };

      return request(app.getHttpServer())
        .post('/api/weather/logs')
        .send(incompleteDto)
        .expect(400)
        .expect((res) => {
          expect(JSON.stringify(res.body.message)).toContain('wind_speed');
        });
    });
  });
});
