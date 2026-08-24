import { Account } from '../../../api/account/entities/account.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  GUEST = 'guest',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: false })
  full_name!: string;

  @Column({ nullable: false })
  email!: string;

  @Column({ default: false })
  email_verified!: boolean;

  @Column({ nullable: false })
  phone!: string;

  @Column({ nullable: false, select: false })
  password!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    nullable: false,
    default: UserRole.CUSTOMER,
  })
  role!: UserRole;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  email_verification_token!: string | null;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  email_verification_expires!: Date | null;

  @UpdateDateColumn()
  updated_at!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @OneToOne(() => Account, (account) => account.user)
  account!: Account;
}
