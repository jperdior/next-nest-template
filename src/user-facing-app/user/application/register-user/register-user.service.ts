import { Injectable, Inject, ConflictException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";
import { UserFacingAppUser } from "../../domain/entities/user.entity";
import { UserRole } from "../../domain/value-objects/role.value-object";
import {
  UserFacingAppUserRepository,
  USER_FACING_APP_USER_REPOSITORY,
} from "../../domain/user.repository";
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
    @Inject(USER_FACING_APP_USER_REPOSITORY)
    private readonly userRepository: UserFacingAppUserRepository,
    private readonly configService: ConfigService
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const validated = RegisterUserInputSchema.parse(input);

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(validated.email);
    if (existingUser) {
      throw new ConflictException(`User with email ${validated.email} already exists`);
    }

    // Get configuration flags
    const skipEmailVerification = this.configService.get('SKIP_EMAIL_VERIFICATION') === 'true';
    const autoActivateUsers = this.configService.get('AUTO_ACTIVATE_USERS') === 'true';

    // Create user entity
    const user = new UserFacingAppUser({
      id: randomUUID(),
      email: validated.email,
      name: validated.name,
      passwordHash: null,
      role: UserRole.ROLE_USER,
      googleId: null,
      avatarUrl: null,
      isEmailVerified: skipEmailVerification,
      emailVerificationToken: null,
      emailVerificationExpiry: null,
      passwordResetToken: null,
      passwordResetExpiry: null,
      isActive: autoActivateUsers,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Set password
    await user.setPassword(validated.password);

    // Persist user
    const created = await this.userRepository.create(user);

    return {
      id: created.getId(),
      email: created.getEmail().getValue(),
      name: created.getName(),
      role: created.getRole().getStringValue(),
      createdAt: created.getCreatedAt(),
    };
  }
}
