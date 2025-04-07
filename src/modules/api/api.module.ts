import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiLogsEntity } from './entities/api_logs.entity';
import { ApiService } from './service/api.service';

@Module({
  controllers: [],
  providers: [ApiService],
  imports: [TypeOrmModule.forFeature([ApiLogsEntity])],
  exports: [ApiService],
})
export class ApiModule {}
