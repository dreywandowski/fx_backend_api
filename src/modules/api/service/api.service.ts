import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { ApiLogsEntity } from '../entities/api_logs.entity';
import axiosInstance from 'src/modules/utils/axios.util';
import { log } from 'node:util';

@Injectable()
export class ApiService {
  constructor(
    @InjectRepository(ApiLogsEntity)
    private readonly apiLogRepository: Repository<ApiLogsEntity>,
  ) {}

  async request(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    payload: {
      req: Request;
      url: string;
      application: string;
      api_payload?: object;
      config?: AxiosRequestConfig;
      from_cron?: boolean;
      from_notification?: boolean;
      params?: any;
    },
  ): Promise<any> {
    const { req, url, application, api_payload, config, params } = payload;

    const logEntry = new ApiLogsEntity();
    logEntry.uri = url;
    logEntry.method = method;
    logEntry.application = application;
    logEntry.headers = JSON.stringify(config);
    logEntry.request_body = await this.safeStringify(api_payload || {});
    logEntry.query_params = await this.safeStringify(params);
    logEntry.originating_ip =
      (Array.isArray(req?.headers['x-real-ip'])
        ? req?.headers['x-real-ip'][0]
        : req?.headers['x-real-ip']) ||
      (Array.isArray(req.headers['x-forwarded-for'])
        ? req.headers['x-forwarded-for'][0]
        : req.headers['x-forwarded-for']) ||
      '';
    logEntry.agent = req.headers['user-agent'] || '';

    const startTime = Date.now();

    try {
      const response: AxiosResponse = await axiosInstance.request({
        method,
        url,
        data: api_payload,
        params,
        ...config,
      });

      logEntry.status_code = response?.status;
      logEntry.response = await this.safeStringify(response?.data);
      logEntry.latency = Date.now() - startTime;
      await this.apiLogRepository.save(logEntry);

      if (response.status < 200 || response.status >= 300) {
        throw response;
      }

      return this.formatApiResponse(response);
    } catch (err) {
      const errorData = err.response?.data || err.message;
      logEntry.response = await this.safeStringify(errorData);
      logEntry.status_code = err.response?.status || 500;
      logEntry.latency = Date.now() - startTime;
      await this.apiLogRepository.save(logEntry);

      return this.formatApiResponse(
        err.response || {
          status: logEntry.status_code,
          data: errorData,
        },
      );
    }
  }

  private async formatApiResponse(response: AxiosResponse) {
    switch (response.status) {
      case HttpStatus.OK:
        return response.data;
      case HttpStatus.UNAUTHORIZED:
        throw new UnauthorizedException('Unauthorized');
      case HttpStatus.BAD_REQUEST:
        throw new BadRequestException(
          response.data?.message ||
            'Check your request parameters and try again',
        );
      case HttpStatus.INTERNAL_SERVER_ERROR:
        throw new InternalServerErrorException(
          response?.data?.message || 'An unexpected error occurred',
        );
      default:
        throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  private safeStringify(payload: object): string {
    const seen = new WeakSet();
    return JSON.stringify(payload, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) return;
        seen.add(value);
      }
      return value;
    });
  }
}
