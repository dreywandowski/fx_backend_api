import { TransactionEntity } from 'src/modules/transaction/entities/transaction.entity/transaction.entity';
import { WalletEntity } from 'src/modules/wallet/entities/wallet.entity';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phone: string;

  @Column({ unique: true })
  username: string;

  @Column({ default: false })
  is_deleted: boolean;

  @Column({ nullable: true })
  deleted_at: Date;

  @Column({ default: false })
  is_suspended: boolean;

  @Column({ nullable: true })
  suspended_at: Date;

  @Column()
  password: string;

  @Column({ default: false })
  email_verified: boolean;

  @Column({ nullable: true })
  email_verified_at: Date;

  @Column({ nullable: true })
  two_factor_secret?: string;

  @Column({ type: 'text', nullable: true })
  two_factor_backup_codes?: string;

  @Column({
    type: 'enum',
    enum: ['email', 'totp', 'sms'],
    default: null,
    nullable: true,
  })
  two_factor_method: 'email' | 'totp' | 'sms' | null;

  @OneToOne(() => WalletEntity, (wallet) => wallet.user)
  wallet: WalletEntity;

  @OneToMany(() => TransactionEntity, (transaction) => transaction.user)
  transactions: TransactionEntity[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
