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

@Entity('wallet')
export class WalletEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => UserEntity, (user) => user.wallet)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  naira: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  dollar: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  pound: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  euro: number;

  @Column({ default: 'naira' })
  default_currency: 'naira' | 'dollar' | 'pound' | 'euro';

  @OneToMany(() => TransactionEntity, (transaction) => transaction.wallet)
  transactions: TransactionEntity[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
