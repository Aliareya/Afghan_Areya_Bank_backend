import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsPositive,
} from 'class-validator';

import {
  TransactionType,
  PayType,
} from '../entities/transaction.entity';

export class CreateTransactionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  sender_account_number?: string;

  @IsString()
  @IsNotEmpty()
  receiver_account_number!: string;

  @IsEnum(TransactionType)
  type!: TransactionType;

  @IsPositive()
  amount!: number;

  @IsEnum(PayType)
  pay_type!: PayType;
}