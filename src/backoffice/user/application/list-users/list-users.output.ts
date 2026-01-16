import { UserRole } from "../../domain/user.entity";

export interface UserListItem {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListUsersOutput {
  users: UserListItem[];
  total: number;
}
