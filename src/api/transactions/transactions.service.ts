import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  PayType,
  Transaction,
  TransactionStatus,
  TransactionType,
} from './entities/transaction.entity';
import { Repository } from 'typeorm';
import { Account } from '../account/entities/account.entity';
import { SitePayDto } from './dto/site_pay.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transacrionRepo: Repository<Transaction>,

    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createTransactionDto: CreateTransactionDto, user_id: number) {
    const { amount, type, pay_type, receiver_account_number } =
      createTransactionDto;

    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    // =========================
    // WALLET DEPOSIT
    // =========================
    if (pay_type === PayType.WALLET && type === TransactionType.DEPOSIT) {
      const receiver = await this.accountRepo.findOne({
        where: {
          user_id,
        },
      });

      if (!receiver) {
        throw new NotFoundException('Account not found');
      }

      const transaction = this.transacrionRepo.create({
        sender: null,
        receiver,
        type: TransactionType.DEPOSIT,
        amount,
        status: TransactionStatus.COMPLETED,
        pay_type: PayType.WALLET,
      });

      const savedTransaction = await this.transacrionRepo.save(transaction);

      receiver.balance = (Number(receiver.balance) + Number(amount)).toFixed(2);

      await this.accountRepo.save(receiver);

      return savedTransaction;
    }

    // =========================
    // CARD TO CARD
    // =========================
    if (
      pay_type === PayType.CARD_TO_CARD &&
      type === TransactionType.WITHDRAW
    ) {
      // Sender = logged-in user's account
      const sender = await this.accountRepo.findOne({
        where: {
          user_id,
        },
      });

      if (!sender) {
        throw new NotFoundException('Sender account not found');
      }

      // Receiver = account number from request
      if (!receiver_account_number) {
        throw new BadRequestException('Receiver account number is required');
      }

      const receiver = await this.accountRepo.findOne({
        where: {
          account_number: receiver_account_number,
        },
      });

      if (!receiver) {
        throw new NotFoundException('Receiver account not found');
      }

      // Don't allow sending to yourself
      if (sender.id === receiver.id) {
        throw new BadRequestException(
          'You cannot transfer money to your own account',
        );
      }

      // Check balance
      if (Number(sender.balance) < Number(amount)) {
        throw new BadRequestException('Insufficient balance');
      }

      // Create transaction
      const transaction = this.transacrionRepo.create({
        sender,
        receiver,
        type: TransactionType.WITHDRAW,
        amount,
        status: TransactionStatus.COMPLETED,
        pay_type: PayType.CARD_TO_CARD,
      });

      const savedTransaction = await this.transacrionRepo.save(transaction);

      // Remove money from sender
      sender.balance = (Number(sender.balance) - Number(amount)).toFixed(2);

      // Add money to receiver
      receiver.balance = (Number(receiver.balance) + Number(amount)).toFixed(2);

      await this.accountRepo.save(sender);
      await this.accountRepo.save(receiver);

      return savedTransaction;
    }

    throw new BadRequestException('Invalid transaction type or payment type');
  }

  async findAll() {
    const transactions = await this.transacrionRepo.find({
      relations: {
        receiver: true,
        sender: true,
      },
    });
    return transactions;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }

  async my_transaction(user_id: number) {
    const transactions = await this.transacrionRepo.find({
      where: [
        {
          receiver: {
            user_id: user_id,
          },
        },
        {
          sender: {
            user_id: user_id,
          },
        },
      ],
      relations: {
        sender: {
          user: true,
        },
        receiver: {
          user: true,
        },
      },
    });

    return transactions;
  }

  async getdashboarddata(user_id: number) {
    const accounts = await this.accountRepo.findOne({
      where: {
        user: {
          id: user_id,
        },
      },
      relations: {
        user: true,
      },
    });

    const transactions = await this.transacrionRepo.find({
      where: [
        {
          receiver: {
            user_id: user_id,
          },
        },
        {
          sender: {
            user_id: user_id,
          },
        },
      ],
      relations: {
        sender: {
          user: true,
        },
        receiver: {
          user: true,
        },
      },
      take: 5,
      order: {
        created_at: 'DESC',
      },
    });

    return {
      transactions,
      accounts,
    };
  }

  async getAccountPin(accountNumber: string) {
  const account = await this.accountRepo
    .createQueryBuilder('account')
    .select(['account.id', 'account.account_pin'])
    .where('account.account_number = :accountNumber', {
      accountNumber,
    })
    .getOne();

  if (!account) {
    throw new NotFoundException('Account not found');
  }

  return account.account_pin;
}

  async site_pay(sitePayDto: SitePayDto) {
  const {
    amount,
    type,
    receiver_account_number,
    sender_account_number,
    account_pin,
  } = sitePayDto;

  const transferAmount = Number(amount);

  if (!Number.isFinite(transferAmount) || transferAmount <= 0) {
    throw new BadRequestException('Amount must be greater than 0');
  }

  if (!sender_account_number || !receiver_account_number) {
    throw new BadRequestException(
      'Sender and receiver account numbers are required',
    );
  }

  if (!account_pin) {
    throw new BadRequestException('Account PIN is required');
  }

  if (sender_account_number === receiver_account_number) {
    throw new BadRequestException(
      'You cannot transfer money to your own account',
    );
  }

  // Get hashed PIN from database
  const hashedPin = await this.getAccountPin(sender_account_number);

  // Compare plain PIN with hashed PIN
  const isPinValid = await bcrypt.compare(
    account_pin,
    hashedPin,
  );

  if (!isPinValid) {
    throw new BadRequestException('Invalid account PIN');
  }

  return await this.dataSource.transaction(async (manager) => {
    const sender = await manager
      .getRepository(Account)
      .createQueryBuilder('account')
      .where('account.account_number = :accountNumber', {
        accountNumber: sender_account_number,
      })
      .setLock('pessimistic_write')
      .getOne();

    if (!sender) {
      throw new NotFoundException('Sender account not found');
    }

    const receiver = await manager
      .getRepository(Account)
      .createQueryBuilder('account')
      .where('account.account_number = :accountNumber', {
        accountNumber: receiver_account_number,
      })
      .setLock('pessimistic_write')
      .getOne();

    if (!receiver) {
      throw new NotFoundException('Receiver account not found');
    }

    const senderBalance = Number(sender.balance);
    const receiverBalance = Number(receiver.balance);

    if (!Number.isFinite(senderBalance)) {
      throw new BadRequestException('Invalid sender balance');
    }

    if (!Number.isFinite(receiverBalance)) {
      throw new BadRequestException('Invalid receiver balance');
    }

    if (senderBalance < transferAmount) {
      throw new BadRequestException('Insufficient balance');
    }

    sender.balance = (senderBalance - transferAmount).toFixed(2);
    receiver.balance = (receiverBalance + transferAmount).toFixed(2);

    await manager.save(Account, sender);
    await manager.save(Account, receiver);

    const transaction = manager.create(Transaction, {
      sender,
      receiver,
      type: type || TransactionType.WITHDRAW,
      amount: transferAmount,
      status: TransactionStatus.COMPLETED,
      pay_type: PayType.CARD_TO_CARD,
      description: `Transfer from ${sender_account_number} to ${receiver_account_number}`,
    });

    const savedTransaction = await manager.save(
      Transaction,
      transaction,
    );

    return {
      message: 'Transaction successful',
      transaction: savedTransaction,
      new_sender_balance: sender.balance,
      new_receiver_balance: receiver.balance,
    };
  });
}
}
