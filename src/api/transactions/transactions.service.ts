import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PayType,
  Transaction,
  TransactionStatus,
  TransactionType,
} from './entities/transaction.entity';
import { Repository } from 'typeorm';
import { Account } from '../account/entities/account.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transacrionRepo: Repository<Transaction>,

    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
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

  async my_transaction(user_id:number) {
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
      relations:{
        sender:{
          user:true
        },
        receiver:{
          user:true
        }
      }
    });

    return transactions
  }
}
