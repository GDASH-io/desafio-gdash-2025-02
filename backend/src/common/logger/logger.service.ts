import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogContext {
  service: string;
  module?: string;
  operation?: string;
  [key: string]: any;
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const service = context?.service || 'unknown';
    const module = context?.module ? `[${context.module}]` : '';
    const operation = context?.operation ? `(${context.operation})` : '';
    
    const contextStr = context
      ? Object.entries(context)
          .filter(([key]) => !['service', 'module', 'operation'].includes(key))
          .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
          .join(' ')
      : '';

    return `[${timestamp}] [${level.toUpperCase()}] [${service}]${module}${operation} ${message} ${contextStr}`.trim();
  }

  log(message: string, context?: LogContext) {
    console.log(this.formatMessage(LogLevel.INFO, message, context));
  }

  error(message: string, trace?: string, context?: LogContext) {
    const errorContext = trace ? { ...context, trace } : context;
    console.error(this.formatMessage(LogLevel.ERROR, message, errorContext));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage(LogLevel.WARN, message, context));
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development' || process.env.LOG_LEVEL === 'debug') {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
    }
  }

  verbose(message: string, context?: LogContext) {
    this.debug(message, context);
  }
}

