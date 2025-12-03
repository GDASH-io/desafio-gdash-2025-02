import { InternalServerErrorException } from '@nestjs/common';

export class ExportException extends InternalServerErrorException {
  constructor(format: string, reason?: string) {
    super(
      `Failed to export ${format}${reason ? `: ${reason}` : ''}`
    );
  }
}

