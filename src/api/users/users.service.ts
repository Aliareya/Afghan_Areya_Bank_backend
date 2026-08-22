import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserResponseDto } from './dto/user-response.dto';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existsUser = await this.findByEmail(createUserDto.email);

    if (existsUser) {
      throw new ConflictException('This Email Already Exists');
    }

    const hashPassword = await bcrypt.hash(createUserDto.password, 12);

    const verifyToken = crypto.randomBytes(32).toString('hex');

    const verifyTokenHash = crypto
      .createHash('sha256')
      .update(verifyToken)
      .digest('hex');

    const verifyTokenExpires = new Date(Date.now() + 2 * 60 * 1000);

    const user = this.userRepository.create({
      full_name: createUserDto.full_name,
      email: createUserDto.email,
      phone: createUserDto.phone,
      password: hashPassword,
      email_verification_token: verifyTokenHash,
      email_verification_expires: verifyTokenExpires,
      email_verified: false,
    });

    const savedUser = await this.userRepository.save(user);

    const verificationUrl = `http://localhost:3000/api/auth/verify-email?token=${verifyToken}`;

    await this.mailService.sendEmail(
      user.email,
      'Verify Your Email - Afghan Areya Bank',
      'verify-email',
      {
        fullName: user.full_name,
        verificationUrl,
        email: user.email,
      },
    );

    return {
      message:
        'User Created Successfully. Please check your email to verify your account.',
      user_id: savedUser?.id,
    };
  }

  findAll() {
    return `This action returns all users`;
  }

  async findByEmail(email: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
    return user;
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      email_verified: user.email_verified,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
  
  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async verifyEmail(token: string) {
    if (!token) {
      throw new ConflictException('Verification token is required');
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.userRepository.findOne({
      where: {
        email_verification_token: tokenHash,
      },
    });

    if (!user) {
      throw new NotFoundException('Invalid or expired verification token');
    }

    if (
      !user.email_verification_expires ||
      user.email_verification_expires < new Date()
    ) {
      throw new ConflictException('Verification token has expired');
    }

    if (user.email_verified) {
      return {
        message: 'Email is already verified',
      };
    }

    // Verify email
    user.email_verified = true;

    // Remove token so it cannot be used again
    user.email_verification_token = null;
    user.email_verification_expires = null;

    await this.userRepository.save(user);

    // Send welcome email
    await this.mailService.sendEmail(
      user.email,
      'Welcome To Afghan Areya Bank',
      'wellcome',
      {
        fullName: user.full_name,
        loginUrl: 'http://localhost:5173/login',
        email: user.email,
      },
    );

    return {
      message: 'Email verified successfully',
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.email_verified) {
      return {
        message: 'Email is already verified',
      };
    }

    const verifyToken = crypto.randomBytes(32).toString('hex');

    const verifyTokenHash = crypto
      .createHash('sha256')
      .update(verifyToken)
      .digest('hex');

    const verifyTokenExpires = new Date(Date.now() + 15 * 60 * 1000);

    user.email_verification_token = verifyTokenHash;
    user.email_verification_expires = verifyTokenExpires;

    await this.userRepository.save(user);

    const verificationUrl = `http://localhost:3000/api/auth/verify-email?token=${verifyToken}`;

    await this.mailService.sendEmail(
      user.email,
      'Verify Your Email - Afghan Areya Bank',
      'verify-email',
      {
        fullName: user.full_name,
        verificationUrl,
        email: user.email,
      },
    );

    return {
      message: 'A new verification email has been sent',
    };
  }
}
