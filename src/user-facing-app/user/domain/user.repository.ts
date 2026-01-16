import { UserFacingAppUser } from "./entities/user.entity";

/**
 * Token for dependency injection
 */
export const USER_FACING_APP_USER_REPOSITORY = Symbol("USER_FACING_APP_USER_REPOSITORY");

/**
 * UserFacingAppUserRepository Interface
 * 
 * Repository interface for the UserFacingApp User aggregate.
 * Contains methods for auth-related operations.
 */
export interface UserFacingAppUserRepository {
  /**
   * Find a user by email
   */
  findByEmail(email: string): Promise<UserFacingAppUser | null>;

  /**
   * Find a user by ID
   */
  findById(id: string): Promise<UserFacingAppUser | null>;

  /**
   * Create a new user
   */
  create(user: UserFacingAppUser): Promise<UserFacingAppUser>;

  /**
   * Update an existing user
   */
  update(user: UserFacingAppUser): Promise<void>;
}
