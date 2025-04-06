import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: any = {
      errorType: 'Internal Server Error',
      message: 'An unexpected error occurred',
      errors: [],
    };
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();

      if (typeof responseBody === 'string') {
        errorResponse.message = responseBody;
      } else if (typeof responseBody === 'object' && responseBody !== null) {
        errorResponse = { ...errorResponse, ...responseBody };
      }

      errorResponse.errorType = exception.constructor.name;
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      errorResponse.errorType = 'Database Query Error';
      errorResponse.message =
        (exception as any).driverError.message || 'A database query failed';
      errorResponse.query = (exception as any).query || null;
      errorResponse.parameters = (exception as any).parameters || [];
    } else {
      errorResponse.errorType =
        (exception as Error).constructor?.name || 'Unknown Error';
      errorResponse.message =
        (exception as Error)?.message || 'An unknown error occurred';

      if (process.env.NODE_ENV !== 'production') {
        errorResponse.stack = (exception as Error)?.stack || null;
      }
    }

    response.status(status).json({
      status: false,
      statusCode: status,
      errorType: errorResponse.errorType,
      message: errorResponse.message,
      query: errorResponse.query || undefined,
      parameters: errorResponse.parameters || undefined,
      errors: errorResponse.errors || [],
      data: null,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
