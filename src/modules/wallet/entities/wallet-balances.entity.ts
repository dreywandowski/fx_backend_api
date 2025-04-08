import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { WalletEntity } from './wallet.entity';
import { Currency } from '../types';

@Entity('wallet_balances')
@Unique(['wallet', 'currency'])
export class WalletBalanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => WalletEntity, (wallet) => wallet.balances, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'wallet_id' })
  wallet: WalletEntity;

  @Column({
    type: 'enum',
    enum: Currency,
    enumName: 'currency_enum',
    default: Currency.NGN,
  })
  currency: Currency;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  locked_balance: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
