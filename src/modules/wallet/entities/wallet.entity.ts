import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { TransactionEntity } from 'src/modules/transaction/entities/transaction.entity/transaction.entity';
import { WalletBalanceEntity } from './wallet-balances.entity';
import { Currency } from '../types';

@Entity('wallet')
export class WalletEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => UserEntity, (user) => user.wallet)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.NGN,
  })
  default_currency: Currency;

  @OneToMany(() => TransactionEntity, (transaction) => transaction.wallet)
  transactions: TransactionEntity[];

  @OneToMany(() => WalletBalanceEntity, (balance) => balance.wallet)
  balances: WalletBalanceEntity[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
