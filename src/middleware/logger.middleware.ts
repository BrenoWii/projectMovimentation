import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl, headers } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    // Log request details
    this.logger.log(`--> ${method} ${originalUrl}`);
    
    // Log headers (excluding sensitive data)
    const relevantHeaders = {
      'content-type': headers['content-type'],
      'content-length': headers['content-length'],
      'authorization': headers['authorization'] ? 'Bearer ***' : undefined,
    };
    this.logger.debug(`    Headers: ${JSON.stringify(relevantHeaders)}`);

    // Log request body for POST/PUT/PATCH (limit size)
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const body = request.body;
      if (body && Object.keys(body).length > 0) {
        const bodyStr = JSON.stringify(body);
        if (bodyStr.length > 500) {
          this.logger.debug(`    Body (truncated): ${bodyStr.substring(0, 500)}...`);
          this.logger.debug(`    Body size: ${bodyStr.length} chars`);
        } else {
          this.logger.debug(`    Body: ${bodyStr}`);
        }
      }
    }

    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      const responseTime = Date.now() - startTime;

      const statusEmoji = statusCode >= 500 ? '❌' : statusCode >= 400 ? '⚠️' : '✅';
      
      this.logger.log(
        `${statusEmoji} ${method} ${originalUrl} ${statusCode} ${contentLength || 0}bytes - ${responseTime}ms - ${ip}`
      );

      // Log warning for slow requests
      if (responseTime > 1000) {
        this.logger.warn(`Slow request detected: ${method} ${originalUrl} took ${responseTime}ms`);
      }

      // Log error details for 4xx and 5xx
      if (statusCode >= 400) {
        this.logger.error(`Request failed with status ${statusCode}: ${method} ${originalUrl}`);
      }
    });

    next();
  }
}
