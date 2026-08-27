import { Account } from '../../../api/account/entities/account.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum PayType {
  WALLET = 'wallet',
  CARD_TO_CARD = 'card_to_card',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'sender_id' })
  sender!: Account | null;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'receiver_id' })
  receiver!: Account;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type!: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status!: TransactionStatus;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
  })
  amount!: number;

  @CreateDateColumn()
  created_at!: Date;

  @Column({
    type: 'enum',
    enum: PayType,
  })
  pay_type!: PayType;
}