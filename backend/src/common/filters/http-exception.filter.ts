import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtro global de exceções HTTP que padroniza as respostas de erro
 * e garante que detalhes internos não sejam expostos em produção.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const isDevelopment = process.env.NODE_ENV !== 'production';

    let message: string | object;
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exception.message;
    } else {
      message = isDevelopment
        ? (exception as Error).message
        : 'Internal server error';
    }

    // Log do erro (sem expor dados sensíveis)
    const errorLog = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      origin: request.headers.origin || 'no-origin',
      message: typeof message === 'string' ? message : JSON.stringify(message),
      ...(isDevelopment && {
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    };

    if (status >= 500) {
      this.logger.error('Internal server error', errorLog);
    } else {
      this.logger.warn('Client error', errorLog);
    }

    // Resposta padronizada
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: Array.isArray(message) ? message : [message],
      ...(isDevelopment && {
        error: exception instanceof Error ? exception.name : 'Error',
      }),
    };

    response.status(status).json(errorResponse);
  }
}

