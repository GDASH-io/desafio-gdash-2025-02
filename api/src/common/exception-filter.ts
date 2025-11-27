import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from './logger.service';

export interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  error: string;
  details?: any;
  requestId: string;
}

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('ExceptionFilter');
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    let status: number;
    let message: string;
    let error: string;
    let details: any = null;

    // Handle different types of exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || 'Bad Request';
        details = (exceptionResponse as any).details;
      } else {
        message = exceptionResponse as string;
        error = exception.name;
      }
    } else if (exception instanceof Error) {
      // Handle standard JavaScript errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message || 'Internal server error occurred';
      error = exception.name || 'InternalServerError';
      
      // Check for specific error types
      if (exception.name === 'ValidationError') {
        status = HttpStatus.BAD_REQUEST;
        error = 'ValidationError';
      } else if (exception.name === 'MongoError' || exception.name === 'MongoServerError') {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        error = 'DatabaseError';
        message = 'Database service is currently unavailable';
        details = process.env.NODE_ENV === 'development' ? exception.message : null;
      } else if (exception.name === 'TimeoutError') {
        status = HttpStatus.REQUEST_TIMEOUT;
        error = 'TimeoutError';
        message = 'Request timeout - operation took too long to complete';
      } else if (exception.message?.includes('ECONNREFUSED')) {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        error = 'ServiceUnavailable';
        message = 'External service is currently unavailable';
      }
    } else {
      // Handle unknown exceptions
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected error occurred';
      error = 'UnknownError';
      details = process.env.NODE_ENV === 'development' ? String(exception) : null;
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp,
      path: request.url,
      method: request.method,
      message,
      error,
      requestId,
      ...(details && { details }),
    };

    // Log the error with appropriate level
    const logMetadata = {
      requestId,
      userId: (request as any).user?.id,
      userAgent: request.get('User-Agent'),
      ip: request.ip,
      body: this.sanitizeRequestBody(request.body),
      query: request.query,
      params: request.params,
      stack: exception instanceof Error ? exception.stack : undefined,
    };

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${message}`,
        exception instanceof Error ? exception.stack : undefined,
        'GlobalExceptionFilter',
        logMetadata,
      );
    } else if (status >= 400) {
      this.logger.warn(
        `${request.method} ${request.url} - ${status} - ${message}`,
        'GlobalExceptionFilter',
        logMetadata,
      );
    }

    // Security logging for suspicious activities
    if (status === HttpStatus.UNAUTHORIZED || status === HttpStatus.FORBIDDEN) {
      this.logger.logSecurityEvent(
        `Access denied: ${request.method} ${request.url}`,
        'medium',
        {
          ip: request.ip,
          userAgent: request.get('User-Agent'),
          path: request.url,
          method: request.method,
        },
      );
    }

    // Rate limiting detection
    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      this.logger.logSecurityEvent(
        `Rate limit exceeded: ${request.ip}`,
        'high',
        {
          ip: request.ip,
          userAgent: request.get('User-Agent'),
          path: request.url,
        },
      );
    }

    response.status(status).json(errorResponse);
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeRequestBody(body: any): any {
    if (!body) return body;

    // Remove sensitive information from logs
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    const sanitized = { ...body };

    const sanitizeObject = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;

      const result = Array.isArray(obj) ? [] : {};
      
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        if (sensitiveFields.some(field => lowerKey.includes(field))) {
          result[key] = '***REDACTED***';
        } else if (typeof value === 'object' && value !== null) {
          result[key] = sanitizeObject(value);
        } else {
          result[key] = value;
        }
      }
      
      return result;
    };

    return sanitizeObject(sanitized);
  }
}

// Custom exceptions for specific business logic errors
export class WeatherDataNotFoundError extends HttpException {
  constructor(location: string) {
    super(
      {
        message: `Weather data not found for location: ${location}`,
        error: 'WeatherDataNotFound',
        details: { location },
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class ExternalApiError extends HttpException {
  constructor(service: string, originalError?: string) {
    super(
      {
        message: `External API error from ${service}`,
        error: 'ExternalApiError',
        details: { service, originalError },
      },
      HttpStatus.BAD_GATEWAY,
    );
  }
}

export class InvalidLocationError extends HttpException {
  constructor(location: string) {
    super(
      {
        message: `Invalid location format: ${location}`,
        error: 'InvalidLocation',
        details: { location },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class DataExportError extends HttpException {
  constructor(format: string, reason?: string) {
    super(
      {
        message: `Failed to export data in ${format} format`,
        error: 'DataExportError',
        details: { format, reason },
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class InsightGenerationError extends HttpException {
  constructor(reason?: string) {
    super(
      {
        message: 'Failed to generate weather insights',
        error: 'InsightGenerationError',
        details: { reason },
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}