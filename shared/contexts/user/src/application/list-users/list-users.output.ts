export interface UserListItem {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListUsersOutput {
  users: UserListItem[];
  total: number;
}
