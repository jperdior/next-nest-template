import { BackofficeUser } from "./user.entity";

/**
 * Token for dependency injection
 */
export const BACKOFFICE_USER_REPOSITORY = Symbol("BACKOFFICE_USER_REPOSITORY");

/**
 * BackofficeUserRepository Interface
 * 
 * Repository interface for the Backoffice User aggregate.
 * Contains only the methods needed for admin operations.
 */
export interface BackofficeUserRepository {
  /**
   * Find all users for admin listing
   */
  findAll(): Promise<BackofficeUser[]>;

  /**
   * Find a user by ID
   */
  findById(id: string): Promise<BackofficeUser | null>;

  /**
   * Save user changes (e.g., activate/deactivate)
   */
  save(user: BackofficeUser): Promise<void>;
}
