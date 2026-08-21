import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

enum UserRole {
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

  @Column({ nullable: true })
  email_verified!: boolean;

  @Column({ nullable: false })
  phone!: string;

  @Column({ nullable: false })
  password!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    nullable: false,
    default: UserRole.CUSTOMER,
  })
  role!: UserRole;

  @UpdateDateColumn()
  updated_at!: Date;

  @CreateDateColumn()
  created_at!: Date;
}
