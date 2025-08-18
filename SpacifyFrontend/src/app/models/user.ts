import { UserRole } from '../enums/user-role.enum';

export interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  username: string;
  role: UserRole;
  exp?: Date;
}
