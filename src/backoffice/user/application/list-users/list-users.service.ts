import { Injectable, Inject } from "@nestjs/common";
import {
  BackofficeUserRepository,
  BACKOFFICE_USER_REPOSITORY,
} from "../../domain/user.repository";
import { ListUsersOutput } from "./list-users.output";

/**
 * List Users Use Case
 * 
 * Retrieves all users for backoffice administration.
 */
@Injectable()
export class ListUsersService {
  constructor(
    @Inject(BACKOFFICE_USER_REPOSITORY)
    private readonly userRepository: BackofficeUserRepository
  ) {}

  async execute(): Promise<ListUsersOutput> {
    const users = await this.userRepository.findAll();

    return {
      users: users.map((user) => user.toPrimitives()),
      total: users.length,
    };
  }
}
