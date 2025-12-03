import { Request, Response, NextFunction } from 'express';
import { createLogger, format, transports } from 'winston';
import { config } from '../config';

export const logger = createLogger({
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [new transports.Console()],
});

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs,
      ip: req.ip,
      userId: (req as any).user?.userId,
    });
  });

  next();
};


