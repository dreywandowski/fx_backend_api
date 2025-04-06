import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { HttpService } from 'src/modules/http/service/http.service';

@Injectable()
export class ApiLoggerInterceptor implements NestInterceptor {
  constructor(private readonly httpService: HttpService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpCtx = context.switchToHttp();
    const request = httpCtx.getRequest<Request>();
    const response = httpCtx.getResponse<Response>();
    const start = Date.now();

    return next.handle().pipe(
      tap(async (data) => {
        const latency = Date.now() - start;
        const method = request.method.toUpperCase() as
          | 'GET'
          | 'POST'
          | 'PUT'
          | 'PATCH'
          | 'DELETE';

        const log = {
          req: request,
          url: request.originalUrl,
          application: (request.headers['x-app-id'] as string) || 'unknown',
          api_payload: {
            uri: request.originalUrl,
            method: request.method,
            headers: request.headers,
            query_params: request.query,
            request_body: request.body,
            originating_ip:
              (Array.isArray(request.headers['x-forwarded-for'])
                ? request.headers['x-forwarded-for'][0]
                : request.headers['x-forwarded-for']) ||
              request.ip ||
              'unknown',
            agent: request.headers['user-agent'] || '',
            response: data,
            status_code: response.statusCode,
            latency,
          },
        };

        await this.httpService.request(method, log);
      }),
    );
  }
}
