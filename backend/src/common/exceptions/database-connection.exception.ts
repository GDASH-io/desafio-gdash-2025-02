import { ServiceUnavailableException } from '@nestjs/common';

export class DatabaseConnectionException extends ServiceUnavailableException {
  constructor(readyState?: number) {
    super(
      `Database connection not available. ReadyState: ${readyState || 'unknown'}`
    );
  }
}

