import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { WalletEntity } from 'src/modules/wallet/entities/wallet.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { TransactionType } from '../../types';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'varchar', length: 255 })
  reference: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('decimal', { precision: 18, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: ['success', 'failed', 'reversed', 'pending'],
    default: 'pending',
  })
  status: 'success' | 'failed' | 'reversed' | 'pending';

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 18, scale: 6, nullable: true })
  rate_used: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  currency: string;

  @ManyToOne(() => WalletEntity, (wallet) => wallet.transactions, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'wallet_id' })
  wallet: WalletEntity;

  @ManyToOne(() => UserEntity, (user) => user.transactions, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;
}
