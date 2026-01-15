import { Injectable, Inject } from "@nestjs/common";
import {
  UserRepositoryInterface,
  USER_REPOSITORY,
} from "../../domain/repositories/user.repository.interface";
import { InvalidCredentialsException } from "../../domain/exceptions/invalid-credentials.exception";
import {
  LoginUserInput,
  LoginUserInputSchema,
} from "./login-user.input";
import { LoginUserOutput } from "./login-user.output";

/**
 * Login User Use Case
 * Authenticates a user with email and password
 */
@Injectable()
export class LoginUserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    // Validate input
    const validated = LoginUserInputSchema.parse(input);

    // Find user by email
    const user = await this.userRepository.findByEmail(validated.email);
    if (!user) {
      throw new InvalidCredentialsException("Invalid credentials");
    }

    // Check if user can login (active + verified or has Google SSO)
    if (!user.canLogin()) {
      throw new InvalidCredentialsException(
        "Account is not active or email not verified"
      );
    }

    // Verify password
    const isPasswordValid = await user.verifyPassword(validated.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException("Invalid credentials");
    }

    // Record login timestamp
    user.recordLogin();

    // Update user in repository
    await this.userRepository.update(user);

    // Return user data
    return {
      id: user.getId(),
      email: user.getEmail().getValue(),
      name: user.getName(),
      role: user.getRole().getValue(),
    };
  }
}
