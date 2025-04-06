import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): string {
    return 'Service is up and running!';
  }

  getVersion(): string {
    return '1.0.0';
  }
}
