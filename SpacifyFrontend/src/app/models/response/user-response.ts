import { UserRole } from '../../enums/user-role.enum';

export interface UserResponse {
  id: string;
  name: string;
  surname: string;
  email: string;
  username: string;
  role: UserRole;
}
