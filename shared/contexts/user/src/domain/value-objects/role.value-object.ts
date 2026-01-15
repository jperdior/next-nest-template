import { z } from "zod";

/**
 * User Role Enum
 * Defines the authorization levels in the system
 */
export enum UserRole {
  ROLE_USER = "ROLE_USER",
  ROLE_ADMIN = "ROLE_ADMIN",
  ROLE_SUPERADMIN = "ROLE_SUPERADMIN",
}

/**
 * Zod schema for Role validation
 */
const RoleSchema = z.nativeEnum(UserRole);

/**
 * Role hierarchy for privilege comparison
 */
const HIERARCHY: Record<UserRole, number> = {
  [UserRole.ROLE_USER]: 1,
  [UserRole.ROLE_ADMIN]: 2,
  [UserRole.ROLE_SUPERADMIN]: 3,
};

/**
 * Role Value Object
 * Encapsulates user role with validation and comparison logic
 */
export class Role {
  private readonly value: UserRole;

  private constructor(value: UserRole) {
    this.value = value;
  }

  /**
   * Create a Role from a string value
   * @throws {Error} if the role is invalid
   */
  static create(value: string): Role {
    const validated = RoleSchema.parse(value);
    return new Role(validated);
  }

  /**
   * Create a Role from the enum directly
   */
  static fromEnum(value: UserRole): Role {
    return new Role(value);
  }

  /**
   * Create default user role
   */
  static default(): Role {
    return new Role(UserRole.ROLE_USER);
  }

  getValue(): UserRole {
    return this.value;
  }

  getStringValue(): string {
    return this.value;
  }

  /**
   * Check if this role is user
   */
  isUser(): boolean {
    return this.value === UserRole.ROLE_USER;
  }

  /**
   * Check if this role is admin
   */
  isAdmin(): boolean {
    return this.value === UserRole.ROLE_ADMIN;
  }

  /**
   * Check if this role is superadmin
   */
  isSuperAdmin(): boolean {
    return this.value === UserRole.ROLE_SUPERADMIN;
  }

  /**
   * Check if this role has admin privileges (ADMIN or SUPERADMIN)
   */
  hasAdminPrivileges(): boolean {
    return this.isAdmin() || this.isSuperAdmin();
  }

  /**
   * Check if this role has higher or equal privileges than another
   */
  hasPrivilegesOf(other: Role): boolean {
    return HIERARCHY[this.value] >= HIERARCHY[other.value];
  }

  /**
   * Check equality with another Role
   */
  equals(other: Role): boolean {
    return this.value === other.value;
  }
}
