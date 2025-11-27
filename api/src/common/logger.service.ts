import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  timestamp: Date;
  metadata?: any;
  userId?: string;
  requestId?: string;
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private logLevel: LogLevel = LogLevel.INFO;
  private context: string = 'Application';

  constructor() {
    // Set log level based on environment
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    switch (envLevel) {
      case 'ERROR':
        this.logLevel = LogLevel.ERROR;
        break;
      case 'WARN':
        this.logLevel = LogLevel.WARN;
        break;
      case 'DEBUG':
        this.logLevel = LogLevel.DEBUG;
        break;
      default:
        this.logLevel = LogLevel.INFO;
    }
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, context?: string, metadata?: any) {
    this.info(message, context, metadata);
  }

  error(message: string, trace?: string, context?: string, metadata?: any) {
    if (this.logLevel >= LogLevel.ERROR) {
      const logEntry: LogEntry = {
        level: LogLevel.ERROR,
        message,
        context: context || this.context,
        timestamp: new Date(),
        metadata: {
          ...metadata,
          trace,
        },
      };
      this.writeLog(logEntry);
    }
  }

  warn(message: string, context?: string, metadata?: any) {
    if (this.logLevel >= LogLevel.WARN) {
      const logEntry: LogEntry = {
        level: LogLevel.WARN,
        message,
        context: context || this.context,
        timestamp: new Date(),
        metadata,
      };
      this.writeLog(logEntry);
    }
  }

  info(message: string, context?: string, metadata?: any) {
    if (this.logLevel >= LogLevel.INFO) {
      const logEntry: LogEntry = {
        level: LogLevel.INFO,
        message,
        context: context || this.context,
        timestamp: new Date(),
        metadata,
      };
      this.writeLog(logEntry);
    }
  }

  debug(message: string, context?: string, metadata?: any) {
    if (this.logLevel >= LogLevel.DEBUG) {
      const logEntry: LogEntry = {
        level: LogLevel.DEBUG,
        message,
        context: context || this.context,
        timestamp: new Date(),
        metadata,
      };
      this.writeLog(logEntry);
    }
  }

  verbose(message: string, context?: string, metadata?: any) {
    this.debug(message, context, metadata);
  }

  // Weather-specific logging methods
  logWeatherDataCollection(city: string, country: string, success: boolean, metadata?: any) {
    const message = `Weather data collection ${success ? 'successful' : 'failed'} for ${city}, ${country}`;
    if (success) {
      this.info(message, 'WeatherService', metadata);
    } else {
      this.error(message, undefined, 'WeatherService', metadata);
    }
  }

  logApiCall(endpoint: string, method: string, statusCode: number, duration: number, userId?: string) {
    const message = `${method} ${endpoint} - ${statusCode} (${duration}ms)`;
    const metadata = {
      endpoint,
      method,
      statusCode,
      duration,
      userId,
    };

    if (statusCode >= 500) {
      this.error(message, undefined, 'API', metadata);
    } else if (statusCode >= 400) {
      this.warn(message, 'API', metadata);
    } else {
      this.info(message, 'API', metadata);
    }
  }

  logExportActivity(format: string, recordCount: number, userId?: string) {
    const message = `Data export completed: ${recordCount} records exported as ${format}`;
    this.info(message, 'ExportService', { format, recordCount, userId });
  }

  logLocationUpdate(newLocation: any, userId?: string) {
    const message = `Location updated to ${newLocation.city}, ${newLocation.country}`;
    this.info(message, 'LocationService', { location: newLocation, userId });
  }

  logInsightGeneration(insightType: string, processingTime: number, dataPoints: number) {
    const message = `AI insight generated: ${insightType} (processed ${dataPoints} data points in ${processingTime}ms)`;
    this.info(message, 'InsightService', { insightType, processingTime, dataPoints });
  }

  // Performance monitoring
  logPerformanceMetric(operation: string, duration: number, metadata?: any) {
    const message = `Performance: ${operation} completed in ${duration}ms`;
    if (duration > 5000) { // Log slow operations as warnings
      this.warn(message, 'Performance', { ...metadata, duration, slow: true });
    } else {
      this.debug(message, 'Performance', { ...metadata, duration });
    }
  }

  // Security logging
  logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high', details?: any) {
    const message = `Security event: ${event}`;
    const metadata = { severity, ...details };
    
    if (severity === 'high') {
      this.error(message, undefined, 'Security', metadata);
    } else if (severity === 'medium') {
      this.warn(message, 'Security', metadata);
    } else {
      this.info(message, 'Security', metadata);
    }
  }

  private writeLog(entry: LogEntry) {
    const timestamp = entry.timestamp.toISOString();
    const level = LogLevel[entry.level];
    const contextStr = entry.context ? `[${entry.context}]` : '';
    
    let output = `${timestamp} [${level}] ${contextStr} ${entry.message}`;
    
    if (entry.metadata) {
      output += ` | ${JSON.stringify(entry.metadata)}`;
    }

    // Output to console with appropriate colors
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(`\x1b[31m${output}\x1b[0m`); // Red
        break;
      case LogLevel.WARN:
        console.warn(`\x1b[33m${output}\x1b[0m`); // Yellow
        break;
      case LogLevel.DEBUG:
        console.debug(`\x1b[36m${output}\x1b[0m`); // Cyan
        break;
      default:
        console.log(`\x1b[32m${output}\x1b[0m`); // Green
    }

    // In production, you would also write to files, external logging services, etc.
    if (process.env.NODE_ENV === 'production') {
      this.writeToFile(entry);
    }
  }

  private writeToFile(entry: LogEntry) {
    // Implementation for file logging would go here
    // This could involve writing to rotating log files, sending to external services like Winston, etc.
  }

  // Utility method to create request context
  createRequestContext(requestId: string, userId?: string) {
    return {
      requestId,
      userId,
      timestamp: new Date(),
    };
  }

  // Health check logging
  logHealthCheck(service: string, status: 'healthy' | 'unhealthy', details?: any) {
    const message = `Health check: ${service} is ${status}`;
    if (status === 'unhealthy') {
      this.error(message, undefined, 'HealthCheck', details);
    } else {
      this.info(message, 'HealthCheck', details);
    }
  }
}