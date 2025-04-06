import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiLogsEntity } from './entities/api_logs.entity';
import { HttpService } from './service/http.service';

@Module({
  controllers: [],
  providers: [HttpService],
  imports: [TypeOrmModule.forFeature([ApiLogsEntity])],
  exports: [HttpService],
})
export class HttpModule {}
