import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('api_logs')
export class ApiLogsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  uri: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  method: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  application: string;

  @Column({ type: 'text', nullable: true })
  headers: string;

  @Column({ type: 'text', nullable: true })
  query_params: string;

  @Column({ type: 'text', nullable: true })
  request_body: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  originating_ip: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  agent: string;

  @Column({ type: 'text', nullable: true })
  response: string;

  @Column()
  status_code: number;

  @Column({ type: 'double precision', nullable: true })
  latency: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
