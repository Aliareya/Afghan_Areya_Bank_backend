import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  account_number!: string;

  @Column()
  account_name!: string;

  @Column({ select: false })
  account_pin!: string;

  @Column({
    default: 'current',
  })
  account_type!: string;

  @Column({
    default: 'AFN',
  })
  currency!: string;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  balance!: string;

  @Column({ default: false })
  is_active!: boolean;

  @Column()
  user_id!: number;

  @OneToOne(() => User, (user) => user.account, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ default: false })
  two_factor_enabled!: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  two_factor_code_expires_at!: Date | null;

  @Column({
    type: 'varchar',
    nullable: true,
    select: false,
  })
  two_factor_code!: string | null;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.sender)
  sent_transactions!: Transaction[];

  @OneToMany(() => Transaction, (transaction) => transaction.receiver)
  received_transactions!: Transaction[];
}
