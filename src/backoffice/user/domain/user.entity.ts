import { z } from "zod";
import { AggregateRoot } from "@testproject/shared";

/**
 * UserRole enum for Backoffice context
 */
export enum UserRole {
  ROLE_USER = "ROLE_USER",
  ROLE_ADMIN = "ROLE_ADMIN",
  ROLE_SUPERADMIN = "ROLE_SUPERADMIN",
}

/**
 * Zod schema for BackofficeUser validation
 */
const BackofficeUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(255),
  role: z.nativeEnum(UserRole),
  isActive: z.boolean(),
  isEmailVerified: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BackofficeUserProps = z.infer<typeof BackofficeUserSchema>;

/**
 * BackofficeUser Entity
 * 
 * Represents a user from the Backoffice bounded context perspective.
 * This entity contains only the fields needed for admin operations:
 * - Listing users
 * - Viewing user details
 * - Activating/deactivating accounts
 * 
 * Authentication-related operations belong to the UserFacingApp context.
 */
export class BackofficeUser extends AggregateRoot {
  private readonly id: string;
  private readonly email: string;
  private readonly name: string;
  private readonly role: UserRole;
  private isActive: boolean;
  private readonly isEmailVerified: boolean;
  private readonly createdAt: Date;
  private readonly updatedAt: Date;

  constructor(props: BackofficeUserProps) {
    super();
    const validated = BackofficeUserSchema.parse(props);
    this.id = validated.id;
    this.email = validated.email;
    this.name = validated.name;
    this.role = validated.role;
    this.isActive = validated.isActive;
    this.isEmailVerified = validated.isEmailVerified;
    this.createdAt = validated.createdAt;
    this.updatedAt = validated.updatedAt;
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getEmail(): string {
    return this.email;
  }

  getName(): string {
    return this.name;
  }

  getRole(): UserRole {
    return this.role;
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  getIsEmailVerified(): boolean {
    return this.isEmailVerified;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Admin operations
  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }

  /**
   * Convert to plain object for persistence/API responses
   */
  toPrimitives(): BackofficeUserProps {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      isActive: this.isActive,
      isEmailVerified: this.isEmailVerified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
