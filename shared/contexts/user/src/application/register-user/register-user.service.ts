import { Injectable, Inject, ConflictException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { UserEntity } from "../../domain/entities/user.entity";
import {
  UserRepositoryInterface,
  USER_REPOSITORY,
} from "../../domain/repositories/user.repository.interface";
import {
  RegisterUserInput,
  RegisterUserInputSchema,
} from "./register-user.input";
import { RegisterUserOutput } from "./register-user.output";

/**
 * Register User Use Case
 * Creates a new user in the system
 */
@Injectable()
export class RegisterUserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    // Validate input
    const validated = RegisterUserInputSchema.parse(input);

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(
      validated.email
    );
    if (existingUser) {
      throw new ConflictException(
        `User with email ${validated.email} already exists`
      );
    }

    // Create user entity
    const user = new UserEntity({
      id: randomUUID(),
      email: validated.email,
      name: validated.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Persist user
    const created = await this.userRepository.create(user);

    // Return output
    return {
      id: created.getId(),
      email: created.getEmail().getValue(),
      name: created.getName(),
      createdAt: created.getCreatedAt(),
    };
  }
}
