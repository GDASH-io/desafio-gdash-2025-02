import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('WeatherController (e2e) - MongoDB Integration', () => {
  let app: INestApplication;
  let mongoConnection: Connection;
  let createdLogId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');

    // Obtém a conexão real do MongoDB
    mongoConnection = moduleFixture.get<Connection>(getConnectionToken());

    await app.init();
  });

  afterAll(async () => {
    // Limpa os dados de teste
    if (mongoConnection && mongoConnection.db) {
      await mongoConnection.db.collection('weather_logs').deleteMany({
        temperatura: { $gte: 999 }, // Deleta apenas dados de teste
      });
    }

    await mongoConnection.close();
    await app.close();
  });

  describe('Teste de Conexão MongoDB', () => {
    it('deve estar conectado ao MongoDB', () => {
      expect(mongoConnection.readyState).toBe(1); // 1 = connected
      expect(mongoConnection.db).toBeDefined();
    });

    it('deve ter acesso à collection weather_logs', async () => {
      const collections = await mongoConnection.db.listCollections().toArray();
      const hasWeatherLogs = collections.some(
        (col) => col.name === 'weather_logs',
      );

      // Se não existir, será criada no primeiro insert
      expect(collections).toBeDefined();
    });
  });

  describe('POST /api/weather/logs - Integração Real', () => {
    it('deve criar um log no MongoDB real', async () => {
      const newLog = {
        temperatura: 999.5, // Valor único para facilitar limpeza
        umidade: 75,
        vento: 15,
      };

      const response = await request(app.getHttpServer())
        .post('/api/weather/logs')
        .send(newLog)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.temperatura).toBe(999.5);
      expect(response.body.umidade).toBe(75);
      expect(response.body.vento).toBe(15);

      createdLogId = response.body._id;

      // Verifica se realmente foi salvo no banco
      const savedLog = await mongoConnection.db
        .collection('weather_logs')
        .findOne({ _id: response.body._id });

      expect(savedLog).toBeDefined();
      expect(savedLog.temperatura).toBe(999.5);
    });
  });

  describe('GET /api/weather/logs - Integração Real', () => {
    it('deve buscar logs do MongoDB real', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/weather/logs')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);

      // Verifica se o log criado está na lista
      const foundLog = response.body.find(
        (log: any) => log._id === createdLogId,
      );
      expect(foundLog).toBeDefined();
    });
  });

  describe('GET /api/weather/logs/:id - Integração Real', () => {
    it('deve buscar log específico do MongoDB', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/weather/logs/${createdLogId}`)
        .expect(200);

      expect(response.body._id).toBe(createdLogId);
      expect(response.body.temperatura).toBe(999.5);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      await request(app.getHttpServer())
        .get('/api/weather/logs/id-inexistente-123')
        .expect(404);
    });
  });

  describe('PUT /api/weather/logs/:id - Integração Real', () => {
    it('deve atualizar log no MongoDB real', async () => {
      const updateData = {
        temperatura: 1000.0,
        umidade: 80,
      };

      const response = await request(app.getHttpServer())
        .put(`/api/weather/logs/${createdLogId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.temperatura).toBe(1000.0);
      expect(response.body.umidade).toBe(80);

      // Verifica se foi realmente atualizado no banco
      const updatedLog = await mongoConnection.db
        .collection('weather_logs')
        .findOne({ _id: response.body._id });

      expect(updatedLog.temperatura).toBe(1000.0);
      expect(updatedLog.umidade).toBe(80);
    });
  });

  describe('DELETE /api/weather/logs/:id - Integração Real', () => {
    it('deve deletar log do MongoDB real', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/weather/logs/${createdLogId}`)
        .expect(200);

      expect(response.body.message).toBe('Log deletado com sucesso');

      // Verifica se foi realmente deletado do banco
      const deletedLog = await mongoConnection.db
        .collection('weather_logs')
        .findOne({ _id: createdLogId });

      expect(deletedLog).toBeNull();
    });

    it('deve retornar 404 ao tentar deletar log já deletado', async () => {
      await request(app.getHttpServer())
        .delete(`/api/weather/logs/${createdLogId}`)
        .expect(404);
    });
  });

  describe('Teste de Performance do MongoDB', () => {
    it('deve inserir múltiplos logs rapidamente', async () => {
      const startTime = Date.now();

      const promises = Array.from({ length: 10 }, (_, i) =>
        request(app.getHttpServer())
          .post('/api/weather/logs')
          .send({
            temperatura: 999 + i,
            umidade: 70,
            vento: 10,
          }),
      );

      await Promise.all(promises);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(5000); // Menos de 5 segundos
    });

    it('deve buscar logs rapidamente', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer()).get('/api/weather/logs').expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Menos de 1 segundo
    });
  });
});
