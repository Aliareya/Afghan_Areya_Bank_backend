import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/loginDto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createuserDto: CreateUserDto) {
    return this.userService.create(createuserDto);
  }

  verifyEmail(token: string) {
    return this.userService.verifyEmail(token);
  }

  resendVerificationEmail(email: string) {
    return this.userService.resendVerificationEmail(email);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new NotFoundException('User Not Found...');
    }

    if (!user.email_verified) {
      throw new UnauthorizedException({
        message: 'Please verify your email before logging in',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Create access token
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      message: 'Login successful',

      token: accessToken,

      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        email_verified: user.email_verified,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    };
  }

  async getMe(id: number) {
    const user = await this.userService.findOne(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User fetched successfully',
      user,
    };
  }
}
