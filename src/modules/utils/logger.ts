import { Injectable, Logger } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';

@Injectable()
export class ErrorLogger extends Logger {
  private readonly logger;

  constructor() {
    super();

    const logFormat = format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}] ${message}`;
    });

    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.colorize({ all: true }),
        logFormat,
      ),
      transports: [
        new transports.Console({
          level: 'info',
          format: format.combine(format.colorize({ all: true }), logFormat),
        }),
      ],
    });
  }

  info(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string) {
    this.logger.error(message, { trace });
  }

  log(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }
}
