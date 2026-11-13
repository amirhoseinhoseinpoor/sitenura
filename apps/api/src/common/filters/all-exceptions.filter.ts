import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ErrorBody {
  statusCode: number;
  message: string;
  path: string;
  timestamp: string;
  details?: unknown;
}

/** Normalizes every error into one predictable JSON shape and logs unexpected ones. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const statusCode = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = isHttp ? exception.getResponse() : undefined;

    if (!isHttp) {
      this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    }

    const body: ErrorBody = {
      statusCode,
      message: isHttp ? exception.message : 'Internal server error',
      path: request.url,
      timestamp: new Date().toISOString(),
      ...(typeof payload === 'object' && payload !== null ? { details: payload } : {}),
    };

    response.status(statusCode).json(body);
  }
}
