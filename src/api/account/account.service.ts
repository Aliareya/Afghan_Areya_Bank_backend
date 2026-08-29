import { ConflictException, Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  private async generateAccountNumber(): Promise<string> {
    let accountNumber: string;
    let exists: Account | null;

    do {
      const timestamp = Date.now().toString();
      const random = Math.floor(1000 + Math.random() * 9000);

      accountNumber = `AAB${timestamp}${random}`;

      exists = await this.accountRepository.findOne({
        where: {
          account_number: accountNumber,
        },
      });
    } while (exists);

    return accountNumber;
  }

  async create(createAccountDto: CreateAccountDto, user_id: number) {
    const accountExists = await this.accountRepository.findOne({
      where: {
        user_id,
      },
    });

    if (accountExists) {
      throw new ConflictException('You already have an account');
    }

    const hashedPin = await bcrypt.hash(createAccountDto.account_pin, 10);

    const accountNumber = await this.generateAccountNumber();

    const account = this.accountRepository.create({
      account_number: accountNumber,

      account_name: createAccountDto.account_name,
      account_type: createAccountDto.account_type,
      currency: createAccountDto.currency,

      account_pin: hashedPin,

      user_id,

      balance: '0',
      is_active: true,

      two_factor_enabled: createAccountDto.two_factor_enabled,

      two_factor_code: null,
      two_factor_code_expires_at: null,
    });

    const savedAccount = await this.accountRepository.save(account);

    const {
      account_pin,
      two_factor_code,
      two_factor_code_expires_at,
      ...result
    } = savedAccount;

    return result;
  }

  async getMyAccounts(user_id: number) {
    const accounts = await this.accountRepository.findOne({
      where: {
        user: {
          id: user_id,
        },
      },
      relations:{
        user:true
      }
    });

    return accounts;
  }

  findAll() {
    return `This action returns all account`;
  }

  findOne(id: number) {
    return `This action returns a #${id} account`;
  }

  update(id: number, updateAccountDto: UpdateAccountDto) {
    return `This action updates a #${id} account`;
  }

  remove(id: number) {
    return `This action removes a #${id} account`;
  }
}
