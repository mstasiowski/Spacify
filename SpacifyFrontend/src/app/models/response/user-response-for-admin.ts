import { UserRole } from '../../enums/user-role.enum';

export interface UserResponseForAdmin {
  id: string;
  name: string;
  surname: string;
  email: string;
  username: string;
  role: UserRole;
  failedLoginAttempts: number;
  accountBlockedUntill: Date | null;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt?: Date | null;
  lastLoginAt?: Date | null;
}
