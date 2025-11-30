import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Log detailed error information
    this.logger.error('=== Exception Caught ===');
    this.logger.error(`Path: ${request.method} ${request.url}`);
    this.logger.error(`Status: ${status}`);
    this.logger.error(`Message: ${JSON.stringify(message)}`);
    
    if (exception instanceof Error) {
      this.logger.error(`Error: ${exception.message}`);
      this.logger.error(`Stack: ${exception.stack}`);
    }

    // Log request body if present
    if (request.body && Object.keys(request.body).length > 0) {
      const bodyStr = JSON.stringify(request.body);
      if (bodyStr.length > 1000) {
        this.logger.error(`Request body (truncated): ${bodyStr.substring(0, 1000)}...`);
      } else {
        this.logger.error(`Request body: ${bodyStr}`);
      }
    }

    this.logger.error('========================');

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof message === 'string' ? message : (message as any).message || message,
    };

    response.status(status).json(errorResponse);
  }
}
