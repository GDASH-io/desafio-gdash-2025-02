import {
  sanitizeForLogging,
  sanitizeString,
} from './log-sanitizer';

describe('Log Sanitizer', () => {
  describe('sanitizeForLogging', () => {
    it('should redact password field', () => {
      const obj = { username: 'user', password: 'secret123' };
      const result = sanitizeForLogging(obj);
      expect(result.password).toBe('[REDACTED]');
      expect(result.username).toBe('user');
    });

    it('should redact token field', () => {
      const obj = { token: 'abc123' };
      const result = sanitizeForLogging(obj);
      expect(result.token).toBe('[REDACTED]');
    });

    it('should redact multiple sensitive fields', () => {
      const obj = {
        username: 'user',
        password: 'secret123',
        token: 'abc123',
        secret: 'mysecret',
        api_key: 'key123',
      };
      const result = sanitizeForLogging(obj);
      expect(result.password).toBe('[REDACTED]');
      expect(result.token).toBe('[REDACTED]');
      expect(result.secret).toBe('[REDACTED]');
      expect(result.api_key).toBe('[REDACTED]');
      expect(result.username).toBe('user');
    });

    it('should redact fields with sensitive keywords in name', () => {
      const obj = {
        userPassword: 'secret',
        authToken: 'token123',
        api_key: 'key123',
        refreshToken: 'refresh123',
      };
      const result = sanitizeForLogging(obj);
      expect(result.userPassword).toBe('[REDACTED]');
      expect(result.authToken).toBe('[REDACTED]');
      expect(result.api_key).toBe('[REDACTED]');
      expect(result.refreshToken).toBe('[REDACTED]');
    });

    it('should recursively sanitize nested objects', () => {
      const obj = {
        user: {
          name: 'John',
          password: 'secret123',
          nested: {
            token: 'abc123',
          },
        },
      };
      const result = sanitizeForLogging(obj);
      expect(result.user.password).toBe('[REDACTED]');
      expect(result.user.nested.token).toBe('[REDACTED]');
      expect(result.user.name).toBe('John');
    });

    it('should handle null and undefined', () => {
      expect(sanitizeForLogging(null as any)).toBe(null);
      expect(sanitizeForLogging(undefined as any)).toBe(undefined);
    });

    it('should handle non-object values', () => {
      expect(sanitizeForLogging('string' as any)).toBe('string');
      expect(sanitizeForLogging(123 as any)).toBe(123);
      expect(sanitizeForLogging(true as any)).toBe(true);
    });

    it('should handle empty objects', () => {
      const result = sanitizeForLogging({});
      expect(result).toEqual({});
    });

    it('should preserve non-sensitive fields', () => {
      const obj = {
        name: 'John',
        email: 'john@example.com',
        age: 30,
      };
      const result = sanitizeForLogging(obj);
      expect(result).toEqual(obj);
    });

    it('should handle arrays with sensitive data', () => {
      const obj = {
        users: [
          { name: 'John', password: 'secret1' },
          { name: 'Jane', password: 'secret2' },
        ],
      };
      const result = sanitizeForLogging(obj);
      expect(result.users[0].password).toBe('[REDACTED]');
      expect(result.users[1].password).toBe('[REDACTED]');
    });
  });

  describe('sanitizeString', () => {
    it('should redact password from string', () => {
      const str = 'User logged in with password: secret123';
      const result = sanitizeString(str);
      expect(result).toContain('[REDACTED]');
      expect(result).not.toContain('secret123');
    });

    it('should redact token from string', () => {
      const str = 'Authorization token: abc123';
      const result = sanitizeString(str);
      expect(result).toContain('[REDACTED]');
      expect(result).not.toContain('abc123');
    });

    it('should redact Bearer token', () => {
      const str = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      const result = sanitizeString(str);
      expect(result).toContain('[REDACTED]');
      expect(result).toContain('Bearer');
    });

    it('should handle multiple patterns in same string', () => {
      const str = 'password: secret123 token: abc123 Bearer xyz789';
      const result = sanitizeString(str);
      expect(result).not.toContain('secret123');
      expect(result).not.toContain('abc123');
      expect(result).not.toContain('xyz789');
    });

    it('should handle non-string values', () => {
      expect(sanitizeString(null as any)).toBe(null);
      expect(sanitizeString(undefined as any)).toBe(undefined);
      expect(sanitizeString(123 as any)).toBe(123);
    });

    it('should handle empty string', () => {
      expect(sanitizeString('')).toBe('');
    });

    it('should handle strings without sensitive data', () => {
      const str = 'This is a normal log message';
      expect(sanitizeString(str)).toBe(str);
    });

    it('should handle case-insensitive patterns', () => {
      const str = 'PASSWORD: secret123 TOKEN: abc123';
      const result = sanitizeString(str);
      expect(result).not.toContain('secret123');
      expect(result).not.toContain('abc123');
    });
  });
});

