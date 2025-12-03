import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';
import { Request, Response } from 'express';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpExceptionFilter],
    }).compile();

    filter = module.get<HttpExceptionFilter>(HttpExceptionFilter);

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      url: '/test',
      method: 'GET',
      headers: {
        origin: 'http://localhost:5173',
      },
    };
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    it('should handle HttpException in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      const mockContext = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => mockRequest,
        }),
      } as ArgumentsHost;

      filter.catch(exception, mockContext);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalled();
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should handle generic error in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const exception = new Error('Test error');
      const mockContext = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => mockRequest,
        }),
      } as ArgumentsHost;

      filter.catch(exception, mockContext);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.message).toEqual(['Internal server error']);
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should handle HttpException', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      const mockContext = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => mockRequest,
        }),
      } as ArgumentsHost;

      filter.catch(exception, mockContext);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should handle HttpException with object response', () => {
      const exception = new HttpException(
        { message: 'Validation failed', errors: [] },
        HttpStatus.BAD_REQUEST,
      );
      const mockContext = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => mockRequest,
        }),
      } as ArgumentsHost;

      filter.catch(exception, mockContext);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should handle generic Error', () => {
      const exception = new Error('Generic error');
      const mockContext = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => mockRequest,
        }),
      } as ArgumentsHost;

      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      filter.catch(exception, mockContext);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it('should hide error details in production', () => {
      const exception = new Error('Generic error');
      const mockContext = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => mockRequest,
        }),
      } as ArgumentsHost;

      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      filter.catch(exception, mockContext);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.message).toContain('Internal server error');

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle array messages', () => {
      const exception = new HttpException(
        { message: ['Error 1', 'Error 2'] },
        HttpStatus.BAD_REQUEST,
      );
      const mockContext = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => mockRequest,
        }),
      } as ArgumentsHost;

      filter.catch(exception, mockContext);

      expect(mockResponse.json).toHaveBeenCalled();
      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(Array.isArray(jsonCall.message)).toBe(true);
    });

    it('should handle HttpException with string response', () => {
      const exception = new HttpException('Simple error message', HttpStatus.BAD_REQUEST);
      const mockContext = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => mockRequest,
        }),
      } as ArgumentsHost;

      filter.catch(exception, mockContext);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.message).toEqual(['Simple error message']);
    });

    it('should log error for 500 status codes', () => {
      const exception = new HttpException('Server error', HttpStatus.INTERNAL_SERVER_ERROR);
      const mockContext = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => mockRequest,
        }),
      } as ArgumentsHost;

      const loggerSpy = jest.spyOn(filter['logger'], 'error');

      filter.catch(exception, mockContext);

      expect(loggerSpy).toHaveBeenCalled();
    });

    it('should log warning for non-500 status codes', () => {
      const exception = new HttpException('Client error', HttpStatus.BAD_REQUEST);
      const mockContext = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => mockRequest,
        }),
      } as ArgumentsHost;

      const loggerSpy = jest.spyOn(filter['logger'], 'warn');

      filter.catch(exception, mockContext);

      expect(loggerSpy).toHaveBeenCalled();
    });

    it('should include error name in development mode', () => {
      const exception = new Error('Test error');
      const mockContext = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => mockRequest,
        }),
      } as ArgumentsHost;

      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      filter.catch(exception, mockContext);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.error).toBe('Error');

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle HttpException with object response containing message', () => {
      const exception = new HttpException(
        { message: 'Custom error message', code: 'ERR001' },
        HttpStatus.BAD_REQUEST,
      );
      const mockContext = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => mockRequest,
        }),
      } as ArgumentsHost;

      filter.catch(exception, mockContext);

      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.message).toEqual(['Custom error message']);
    });

    it('should handle non-Error exception', () => {
      const exception = { message: 'Unknown error' };
      const mockContext = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => mockRequest,
        }),
      } as ArgumentsHost;

      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      filter.catch(exception as any, mockContext);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      const jsonCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.message).toEqual(['Internal server error']);

      process.env.NODE_ENV = originalEnv;
    });
  });
});

