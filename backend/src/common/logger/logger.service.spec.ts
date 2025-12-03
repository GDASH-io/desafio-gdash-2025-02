import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService, LogLevel } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService],
    }).compile();

    service = module.get<LoggerService>(LoggerService);

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.LOG_LEVEL;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should log message with INFO level', () => {
      service.log('Test message');
      expect(consoleLogSpy).toHaveBeenCalled();
      const callArgs = consoleLogSpy.mock.calls[0][0];
      expect(callArgs).toContain('[INFO]');
      expect(callArgs).toContain('Test message');
    });

    it('should log with context', () => {
      service.log('Test message', { service: 'test-service', module: 'test-module' });
      const callArgs = consoleLogSpy.mock.calls[0][0];
      expect(callArgs).toContain('[test-service]');
      expect(callArgs).toContain('[test-module]');
    });

    it('should log with operation context', () => {
      service.log('Test message', { service: 'test', operation: 'create' });
      const callArgs = consoleLogSpy.mock.calls[0][0];
      expect(callArgs).toContain('(create)');
    });

    it('should log with additional context fields', () => {
      service.log('Test message', {
        service: 'test',
        customField: 'value',
        anotherField: 123,
      });
      const callArgs = consoleLogSpy.mock.calls[0][0];
      expect(callArgs).toContain('customField');
      expect(callArgs).toContain('anotherField');
    });
  });

  describe('error', () => {
    it('should log error message', () => {
      service.error('Error message');
      expect(consoleErrorSpy).toHaveBeenCalled();
      const callArgs = consoleErrorSpy.mock.calls[0][0];
      expect(callArgs).toContain('[ERROR]');
      expect(callArgs).toContain('Error message');
    });

    it('should log error with trace', () => {
      service.error('Error message', 'stack trace');
      const callArgs = consoleErrorSpy.mock.calls[0][0];
      expect(callArgs).toContain('stack trace');
    });

    it('should log error with context', () => {
      service.error('Error message', undefined, { service: 'test', module: 'test' });
      const callArgs = consoleErrorSpy.mock.calls[0][0];
      expect(callArgs).toContain('[test]');
    });
  });

  describe('warn', () => {
    it('should log warning message', () => {
      service.warn('Warning message');
      expect(consoleWarnSpy).toHaveBeenCalled();
      const callArgs = consoleWarnSpy.mock.calls[0][0];
      expect(callArgs).toContain('[WARN]');
      expect(callArgs).toContain('Warning message');
    });

    it('should log warning with context', () => {
      service.warn('Warning message', { service: 'test' });
      const callArgs = consoleWarnSpy.mock.calls[0][0];
      expect(callArgs).toContain('[test]');
    });
  });

  describe('debug', () => {
    it('should not log in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      delete process.env.LOG_LEVEL;

      service.debug('Debug message');
      expect(consoleDebugSpy).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it('should log in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      service.debug('Debug message');
      expect(consoleDebugSpy).toHaveBeenCalled();
      const callArgs = consoleDebugSpy.mock.calls[0][0];
      expect(callArgs).toContain('[DEBUG]');

      process.env.NODE_ENV = originalEnv;
    });

    it('should log when LOG_LEVEL is set to debug', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      process.env.LOG_LEVEL = 'debug';

      service.debug('Debug message');
      expect(consoleDebugSpy).toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it('should log debug with context', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      service.debug('Debug message', { service: 'test' });
      const callArgs = consoleDebugSpy.mock.calls[0][0];
      expect(callArgs).toContain('[test]');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('verbose', () => {
    it('should call debug method', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const debugSpy = jest.spyOn(service, 'debug');
      service.verbose('Verbose message');
      expect(debugSpy).toHaveBeenCalledWith('Verbose message', undefined);

      process.env.NODE_ENV = originalEnv;
    });

    it('should pass context to debug', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const debugSpy = jest.spyOn(service, 'debug');
      const context = { service: 'test' };
      service.verbose('Verbose message', context);
      expect(debugSpy).toHaveBeenCalledWith('Verbose message', context);

      process.env.NODE_ENV = originalEnv;
    });
  });
});

