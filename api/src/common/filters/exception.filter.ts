import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class ExceptionFilterWithLogging<T extends HttpException>
  implements ExceptionFilter
{
  private readonly logger = new Logger(ExceptionFilterWithLogging.name);

  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (statusCode !== 404) {
      this.logger.error(
        `Occur an erro: HTTP Exception: ${statusCode} - ${
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : JSON.stringify(exceptionResponse)
        } - - Route: ${req.method} ${req.url}`,
      );
    }
    const err =
      typeof exceptionResponse === 'string'
        ? { message: exceptionResponse }
        : exceptionResponse;

    res.status(statusCode).json({
      ...err,
    });
  }
}
