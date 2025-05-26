import { UserRole } from '../../enums/user-role.enum';

export interface ModifyUserRequest {
  name?: string;
  surname?: string;
  email?: string;
  username?: string;
  role?: UserRole;
}
