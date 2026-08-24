import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty({ message: 'Account name is required' })
  @IsString()
  @Length(2, 100, {
    message: 'Account name must be between 2 and 100 characters',
  })
  account_name!: string;

  @IsNotEmpty({ message: 'PIN is required' })
  @IsString({ message: 'PIN must be a string' })
  @Length(4, 4, { message: 'PIN must be exactly 4 digits' })
  @Matches(/^\d{4}$/, {
    message: 'PIN must contain only numbers',
  })
  account_pin!: string;

  @IsNotEmpty({ message: 'Account type is required' })
  @IsIn(['current', 'savings', 'investment'], {
    message: 'Invalid account type',
  })
  account_type!: string;

  @IsNotEmpty({ message: 'Currency is required' })
  @IsIn(['AFN', 'USD', 'EUR'], { message: 'Invalid currency' })
  currency!: string;

  @IsBoolean({
    message: 'two_factor_enabled must be true or false',
  })
  two_factor_enabled!: boolean;
}
