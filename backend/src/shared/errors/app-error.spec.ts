import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  InternalError,
} from './app-error';

describe('AppError Classes', () => {
  describe('AppError', () => {
    it('should create error with all properties', () => {
      const error = new AppError('Test message', 400, 'TEST_CODE', { field: 'value' });

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test message');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('TEST_CODE');
      expect(error.details).toEqual({ field: 'value' });
      expect(error.name).toBe('AppError');
    });

    it('should have stack trace', () => {
      const error = new AppError('Test', 500, 'CODE');

      expect(error.stack).toBeDefined();
    });
  });

  describe('ValidationError', () => {
    it('should create with 400 status code', () => {
      const error = new ValidationError('Invalid input');

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid input');
    });

    it('should include details', () => {
      const details = { field: 'email', reason: 'invalid format' };
      const error = new ValidationError('Invalid email', details);

      expect(error.details).toEqual(details);
    });
  });

  describe('AuthenticationError', () => {
    it('should create with 401 status code', () => {
      const error = new AuthenticationError();

      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.message).toBe('Authentication failed');
    });

    it('should accept custom message', () => {
      const error = new AuthenticationError('Invalid token');

      expect(error.message).toBe('Invalid token');
    });
  });

  describe('AuthorizationError', () => {
    it('should create with 403 status code', () => {
      const error = new AuthorizationError();

      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('AUTHORIZATION_ERROR');
      expect(error.message).toBe('Insufficient permissions');
    });

    it('should accept custom message', () => {
      const error = new AuthorizationError('Admin only');

      expect(error.message).toBe('Admin only');
    });
  });

  describe('NotFoundError', () => {
    it('should create with 404 status code', () => {
      const error = new NotFoundError('User');

      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBe('User not found');
    });

    it('should format message with resource name', () => {
      const error = new NotFoundError('Weather Log');

      expect(error.message).toBe('Weather Log not found');
    });
  });

  describe('ConflictError', () => {
    it('should create with 409 status code', () => {
      const error = new ConflictError('Resource already exists');

      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT');
      expect(error.message).toBe('Resource already exists');
    });
  });

  describe('InternalError', () => {
    it('should create with 500 status code', () => {
      const error = new InternalError();

      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.message).toBe('Internal server error');
    });

    it('should accept custom message', () => {
      const error = new InternalError('Database connection failed');

      expect(error.message).toBe('Database connection failed');
    });
  });

  describe('Inheritance', () => {
    it('should all inherit from AppError', () => {
      expect(new ValidationError('test')).toBeInstanceOf(AppError);
      expect(new AuthenticationError()).toBeInstanceOf(AppError);
      expect(new AuthorizationError()).toBeInstanceOf(AppError);
      expect(new NotFoundError('test')).toBeInstanceOf(AppError);
      expect(new ConflictError('test')).toBeInstanceOf(AppError);
      expect(new InternalError()).toBeInstanceOf(AppError);
    });

    it('should all inherit from Error', () => {
      expect(new ValidationError('test')).toBeInstanceOf(Error);
      expect(new AuthenticationError()).toBeInstanceOf(Error);
    });
  });
});
