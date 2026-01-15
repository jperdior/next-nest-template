import { Injectable, Inject } from "@nestjs/common";
import {
  UserRepositoryInterface,
  USER_REPOSITORY,
} from "../../domain/repositories/user.repository.interface";
import { ListUsersOutput } from "./list-users.output";

/**
 * List Users Use Case
 * Retrieves all users from the system
 */
@Injectable()
export class ListUsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface
  ) {}

  async execute(): Promise<ListUsersOutput> {
    const users = await this.userRepository.findAll();

    return {
      users: users.map((user) => ({
        id: user.getId(),
        email: user.getEmail().getValue(),
        name: user.getName(),
        createdAt: user.getCreatedAt(),
        updatedAt: user.getUpdatedAt(),
      })),
      total: users.length,
    };
  }
}
