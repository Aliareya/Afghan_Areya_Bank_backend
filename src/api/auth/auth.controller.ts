import {
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  Redirect,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { LoginDto } from './dto/loginDto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  registeruser(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    try {
      await this.authService.verifyEmail(token);

      return res.redirect('http://localhost:5173/email-verified');
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        return res.redirect(
          'http://localhost:5173/resend-verification?error=expired',
        );
      }

      throw error;
    }
  }

  @Post('resend-verification')
  async resendVerification(@Body('email') email: string) {
    return this.authService.resendVerificationEmail(email);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: any) {
    const user_id = req?.user.sub
    return this.authService.getMe(user_id);
  }
}
