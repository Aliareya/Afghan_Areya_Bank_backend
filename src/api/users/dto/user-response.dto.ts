import { UserRole } from '../entities/user.entity';

export class UserResponseDto {
  token!: string;
  user!: {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    role: UserRole;
    created_at: Date;
    updated_at: Date;
  };
}
