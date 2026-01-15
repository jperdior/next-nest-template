export class UserListItemDto {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserListResponseDto {
  users: UserListItemDto[];
  total: number;
}
