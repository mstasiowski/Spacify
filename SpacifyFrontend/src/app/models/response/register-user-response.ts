import { UserRole } from '../../enums/user-role.enum';

export interface RegisterUserResponse {
  id: string;
  name: string;
  surname: string;
  email: string;
  username: string;
  role: UserRole;
  createdAt: string;
}
