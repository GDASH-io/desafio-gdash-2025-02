import { Test, TestingModule } from '@nestjs/testing';
import { commonConstants } from 'src/shared/constants';
import { EncryptService } from '../encrypt.service';
import { InMemoryEncryptAdapter } from '../infraestructure/adapters/inMemory-encrypt.adapter';

describe('EncryptService', () => {
  let service: EncryptService;
  let encryptAdapter: InMemoryEncryptAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncryptService,
        {
          provide: commonConstants.ports.ENCRYPT,
          useClass: InMemoryEncryptAdapter,
        },
      ],
    }).compile();

    service = module.get<EncryptService>(EncryptService);
    encryptAdapter = module.get(commonConstants.ports.ENCRYPT);
    encryptAdapter.reset();
  });

  describe('encryptPassword', () => {
    it('should call encrypt port with password and return encrypted password', async () => {
      const password = 'mySecurePassword123';
      const encryptedPassword = '$2b$10$hashedPasswordExample';
      encryptAdapter.setMockEncryptedPassword(encryptedPassword);

      const result = await service.encryptPassword(password);

      expect(encryptAdapter.getEncryptCallCount()).toBe(1);
      expect(encryptAdapter.getLastEncryptPassword()).toBe(password);
      expect(result).toBe(encryptedPassword);
    });

    it('should handle empty password', async () => {
      const password = '';
      const encryptedPassword = '$2b$10$emptyHashExample';
      encryptAdapter.setMockEncryptedPassword(encryptedPassword);

      const result = await service.encryptPassword(password);

      expect(encryptAdapter.getLastEncryptPassword()).toBe(password);
      expect(result).toBe(encryptedPassword);
    });

    it('should handle special characters in password', async () => {
      const password = 'P@ssw0rd!#$%^&*()';
      const encryptedPassword = '$2b$10$specialCharsHashExample';
      encryptAdapter.setMockEncryptedPassword(encryptedPassword);

      const result = await service.encryptPassword(password);

      expect(encryptAdapter.getLastEncryptPassword()).toBe(password);
      expect(result).toBe(encryptedPassword);
    });

    it('should propagate errors from encrypt port', async () => {
      const password = 'testPassword';
      encryptAdapter.setShouldFailEncrypt(true);

      await expect(service.encryptPassword(password)).rejects.toThrow(
        'InMemory Encrypt failed',
      );
      expect(encryptAdapter.getLastEncryptPassword()).toBe(password);
    });
  });

  describe('verifyPassword', () => {
    it('should call verify port and return true for matching passwords', async () => {
      const password = 'myPassword123';
      const encryptedPassword = '$2b$10$hashedPasswordExample';
      encryptAdapter.setMockVerifyResult(true);

      const result = await service.verifyPassword(encryptedPassword, password);

      expect(encryptAdapter.getVerifyCallCount()).toBe(1);
      expect(encryptAdapter.getLastVerifyParams()).toEqual({
        encryptedPassword,
        password,
      });
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const password = 'wrongPassword';
      const encryptedPassword = '$2b$10$hashedPasswordExample';
      encryptAdapter.setMockVerifyResult(false);

      const result = await service.verifyPassword(encryptedPassword, password);

      expect(encryptAdapter.getLastVerifyParams()).toEqual({
        encryptedPassword,
        password,
      });
      expect(result).toBe(false);
    });

    it('should handle empty encrypted password', async () => {
      const password = 'testPassword';
      const encryptedPassword = '';
      encryptAdapter.setMockVerifyResult(false);

      const result = await service.verifyPassword(encryptedPassword, password);

      expect(encryptAdapter.getLastVerifyParams()).toEqual({
        encryptedPassword,
        password,
      });
      expect(result).toBe(false);
    });

    it('should handle empty plain password', async () => {
      const password = '';
      const encryptedPassword = '$2b$10$hashedPasswordExample';
      encryptAdapter.setMockVerifyResult(false);

      const result = await service.verifyPassword(encryptedPassword, password);

      expect(encryptAdapter.getLastVerifyParams()).toEqual({
        encryptedPassword,
        password,
      });
      expect(result).toBe(false);
    });

    it('should propagate errors from verify port', async () => {
      const password = 'testPassword';
      const encryptedPassword = '$2b$10$hashedPasswordExample';
      encryptAdapter.setShouldFailVerify(true);

      await expect(
        service.verifyPassword(encryptedPassword, password),
      ).rejects.toThrow('InMemory Verify failed');
      expect(encryptAdapter.getLastVerifyParams()).toEqual({
        encryptedPassword,
        password,
      });
    });
  });

  describe('generateNewToken', () => {
    it('should call createAuthToken port with payload and return token', async () => {
      const payload = { userId: '123', email: 'user@example.com' };
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature';
      encryptAdapter.setMockToken(token);

      const result = await service.generateNewToken(payload);

      expect(encryptAdapter.getCreateTokenCallCount()).toBe(1);
      expect(encryptAdapter.getLastCreateTokenPayload()).toEqual(payload);
      expect(result).toBe(token);
    });

    it('should handle payload with multiple properties', async () => {
      const payload = {
        userId: '456',
        email: 'admin@example.com',
        role: 'admin',
        permissions: ['read', 'write', 'delete'],
      };
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.complex.signature';
      encryptAdapter.setMockToken(token);

      const result = await service.generateNewToken(payload);

      expect(encryptAdapter.getLastCreateTokenPayload()).toEqual(payload);
      expect(result).toBe(token);
    });

    it('should handle empty object payload', async () => {
      const payload = {};
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.empty.signature';
      encryptAdapter.setMockToken(token);

      const result = await service.generateNewToken(payload);

      expect(encryptAdapter.getLastCreateTokenPayload()).toEqual(payload);
      expect(result).toBe(token);
    });

    it('should propagate errors from createAuthToken port', async () => {
      const payload = { userId: '789' };
      encryptAdapter.setShouldFailCreateToken(true);

      await expect(service.generateNewToken(payload)).rejects.toThrow(
        'InMemory CreateAuthToken failed',
      );
      expect(encryptAdapter.getLastCreateTokenPayload()).toEqual(payload);
    });
  });

  describe('verifyAuthToken', () => {
    it('should call verifyAuthToken port with token and return decoded payload', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature';
      const decodedPayload = { userId: '123', email: 'user@example.com' };
      encryptAdapter.setMockTokenPayload(decodedPayload);

      const result = service.verifyAuthToken(token);

      expect(encryptAdapter.getVerifyTokenCallCount()).toBe(1);
      expect(encryptAdapter.getLastVerifyTokenToken()).toBe(token);
      expect(result).toEqual(decodedPayload);
    });

    it('should handle token with complex payload', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.complex.signature';
      const decodedPayload = {
        userId: '456',
        email: 'admin@example.com',
        role: 'admin',
        exp: 1735401600,
        iat: 1735315200,
      };
      encryptAdapter.setMockTokenPayload(decodedPayload);

      const result = service.verifyAuthToken(token);

      expect(encryptAdapter.getLastVerifyTokenToken()).toBe(token);
      expect(result).toEqual(decodedPayload);
    });

    it('should handle different payload types', () => {
      interface CustomPayload {
        sessionId: string;
      }

      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.custom.signature';
      const decodedPayload: CustomPayload = {
        sessionId: 'abc-123-xyz',
      };
      encryptAdapter.setMockTokenPayload(decodedPayload);

      const result = service.verifyAuthToken<CustomPayload>(token);

      expect(encryptAdapter.getLastVerifyTokenToken()).toBe(token);
      expect(result).toEqual(decodedPayload);
      expect(result.sessionId).toBe('abc-123-xyz');
    });

    it('should propagate errors from verifyAuthToken port', () => {
      const token = 'invalid.token.signature';
      encryptAdapter.setShouldFailVerifyToken(true);

      expect(() => service.verifyAuthToken(token)).toThrow(
        'InMemory VerifyAuthToken failed',
      );
      expect(encryptAdapter.getLastVerifyTokenToken()).toBe(token);
    });

    it('should handle expired token error', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired.signature';
      encryptAdapter.setShouldFailVerifyToken(true);

      expect(() => service.verifyAuthToken(token)).toThrow(
        'InMemory VerifyAuthToken failed',
      );
      expect(encryptAdapter.getLastVerifyTokenToken()).toBe(token);
    });
  });
});
