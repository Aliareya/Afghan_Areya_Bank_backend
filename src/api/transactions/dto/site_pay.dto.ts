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

export class SitePayDto {
  @IsString()
  @IsNotEmpty()
  sender_account_number?: string;

  @IsString()
  @IsNotEmpty()
  receiver_account_number!: string;

  @IsString()
  @IsNotEmpty()
  account_pin!: string;

  @IsEnum(TransactionType)
  type!: TransactionType;

  @IsPositive()
  amount!: number;

}