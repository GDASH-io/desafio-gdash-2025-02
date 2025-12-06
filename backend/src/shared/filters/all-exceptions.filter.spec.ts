import { AllExceptionsFilter } from './all-exceptions.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { AppError, ValidationError, AuthenticationError } from '../errors/app-error';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    
    mockRequest = {
      method: 'GET',
      url: '/test',
    };
    
    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as any;
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('AppError handling', () => {
    it('should handle ValidationError', () => {
      const error = new ValidationError('Invalid input', { field: 'email' });
      
      filter.catch(error, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          statusCode: 400,
          details: { field: 'email' },
          timestamp: expect.any(String),
          path: '/test',
        },
      });
    });

    it('should handle AuthenticationError', () => {
      const error = new AuthenticationError('Invalid token');
      
      filter.catch(error, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Invalid token',
          statusCode: 401,
          timestamp: expect.any(String),
          path: '/test',
        },
      });
    });

    it('should handle custom AppError', () => {
      const error = new AppError('Custom error', 418, 'CUSTOM_ERROR');
      
      filter.catch(error, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(418);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: 'CUSTOM_ERROR',
          message: 'Custom error',
          statusCode: 418,
          timestamp: expect.any(String),
          path: '/test',
        },
      });
    });
  });

  describe('HttpException handling', () => {
    it('should handle HttpException with string response', () => {
      const error = new HttpException('Not found', HttpStatus.NOT_FOUND);
      
      filter.catch(error, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: 'HTTP_404',
          message: 'Not found',
          statusCode: 404,
          timestamp: expect.any(String),
          path: '/test',
        },
      });
    });

    it('should handle HttpException with object response', () => {
      const error = new HttpException(
        { message: 'Validation failed', errors: ['field1', 'field2'] },
        HttpStatus.BAD_REQUEST
      );
      
      filter.catch(error, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalled();
    });
  });

  describe('Generic Error handling', () => {
    it('should handle standard Error', () => {
      const error = new Error('Something went wrong');
      
      filter.catch(error, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Something went wrong',
          statusCode: 500,
          timestamp: expect.any(String),
          path: '/test',
        },
      });
    });

    it('should handle unknown exception type', () => {
      const error = 'string error';
      
      filter.catch(error, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          statusCode: 500,
          timestamp: expect.any(String),
          path: '/test',
        },
      });
    });
  });

  describe('Request information', () => {
    it('should include request method and URL', () => {
      mockRequest.method = 'POST';
      mockRequest.url = '/api/users';
      const error = new Error('Test error');
      
      filter.catch(error, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            path: '/api/users',
          }),
        })
      );
    });
  });
});
