import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WalletEntity } from 'src/modules/wallet/entities/wallet.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { TransactionType } from '../../types';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  reference: string;

  @Column('decimal', { precision: 10, scale: 2 })
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

  @Column({ nullable: true })
  currency: string;

  @ManyToOne(() => WalletEntity, (wallet) => wallet.transactions, {
    eager: true,
  })
  wallet: WalletEntity;

  @ManyToOne(() => UserEntity, (user) => user.transactions, { eager: true })
  user: UserEntity;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
