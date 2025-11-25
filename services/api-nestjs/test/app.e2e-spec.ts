import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ConfigModule } from '@nestjs/config';

describe('MongoDB Connection Test', () => {
  let connection: Connection;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(
          process.env.MONGO_URI ?? 'mongodb://localhost:27017/nestjs-weather',
        ),
      ],
    }).compile();

    connection = moduleRef.get<Connection>(getConnectionToken());
  });

  afterAll(async () => {
    await connection.close();
    await moduleRef.close();
  });

  describe('Verificação de Conexão', () => {
    it('deve conectar ao MongoDB com sucesso', () => {
      expect(connection.readyState).toBe(1); // 1 = connected
    });

    it('deve ter o nome do banco correto', () => {
      expect(connection.name).toBeDefined();
      expect(typeof connection.name).toBe('string');
    });

    it('deve ter o host configurado', () => {
      expect(connection.host).toBeDefined();
    });

    it('deve listar collections do banco', async () => {
      const collections = await connection.db.listCollections().toArray();
      expect(Array.isArray(collections)).toBe(true);
    });

    it('deve conseguir fazer ping no MongoDB', async () => {
      const adminDb = connection.db.admin();
      const result = await adminDb.ping();
      expect(result.ok).toBe(1);
    });

    it('deve ter info do servidor MongoDB', async () => {
      const adminDb = connection.db.admin();
      const serverInfo = await adminDb.serverInfo();

      expect(serverInfo).toHaveProperty('version');
      expect(serverInfo).toHaveProperty('ok');
      expect(serverInfo.ok).toBe(1);
    });
  });

  describe('Operações CRUD Básicas', () => {
    const testCollection = 'test_connection';

    afterEach(async () => {
      await connection.db.collection(testCollection).deleteMany({});
    });

    it('deve inserir documento', async () => {
      const doc = { test: 'data', timestamp: new Date() };
      const result = await connection.db
        .collection(testCollection)
        .insertOne(doc);

      expect(result.acknowledged).toBe(true);
      expect(result.insertedId).toBeDefined();
    });

    it('deve buscar documento', async () => {
      await connection.db
        .collection(testCollection)
        .insertOne({ test: 'find-test' });

      const found = await connection.db
        .collection(testCollection)
        .findOne({ test: 'find-test' });

      expect(found).toBeDefined();
      expect(found.test).toBe('find-test');
    });

    it('deve atualizar documento', async () => {
      const inserted = await connection.db
        .collection(testCollection)
        .insertOne({ test: 'update-test', value: 1 });

      const updated = await connection.db
        .collection(testCollection)
        .findOneAndUpdate(
          { _id: inserted.insertedId },
          { $set: { value: 2 } },
          { returnDocument: 'after' },
        );

      expect(updated.value).toBe(2);
    });

    it('deve deletar documento', async () => {
      const inserted = await connection.db
        .collection(testCollection)
        .insertOne({ test: 'delete-test' });

      const deleted = await connection.db
        .collection(testCollection)
        .deleteOne({ _id: inserted.insertedId });

      expect(deleted.deletedCount).toBe(1);

      const found = await connection.db
        .collection(testCollection)
        .findOne({ _id: inserted.insertedId });

      expect(found).toBeNull();
    });
  });
});
