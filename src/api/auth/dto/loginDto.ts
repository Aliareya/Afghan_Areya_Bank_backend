import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsNotEmpty({
    message: 'Email is required',
  })
  @IsEmail(
    {},
    {
      message: 'Please enter a valid email',
    },
  )
  email!: string;

  @IsNotEmpty({
    message: 'Password is required',
  })
  @IsString()
  @MinLength(8, {
    message: 'Password must be at least 8 characters',
  })
  password!: string;
}