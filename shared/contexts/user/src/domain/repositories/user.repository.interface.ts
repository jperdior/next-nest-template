import { UserEntity } from "../entities/user.entity";

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");

/**
 * User Repository Interface (Port)
 * Defines the contract for user data access
 */
export interface UserRepositoryInterface {
  create(user: UserEntity): Promise<UserEntity>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByGoogleId(googleId: string): Promise<UserEntity | null>;
  findByEmailVerificationToken(token: string): Promise<UserEntity | null>;
  findByPasswordResetToken(token: string): Promise<UserEntity | null>;
  findAll(): Promise<UserEntity[]>;
  update(user: UserEntity): Promise<UserEntity>;
  delete(id: string): Promise<void>;
}
