import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Full Name Is Required...' })
  @IsString()
  full_name!: string;

  @IsNotEmpty({ message: 'Email Is Required...' })
  @IsEmail({}, { message: 'Email Is Not Valid...' })
  email!: string;

  @IsNotEmpty({ message: 'Phone Is Required...' })
  @IsPhoneNumber('AF',{ message: 'Phone Number Is Not Valid...' })
  phone!: string;

  @IsNotEmpty({ message: 'Password Is Required...' })
  @MinLength(8, { message: 'Password Must Be At Least 8 Characters...' })
  password!: string;
}
