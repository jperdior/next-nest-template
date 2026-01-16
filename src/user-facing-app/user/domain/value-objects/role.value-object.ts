import { z } from "zod";

/**
 * User Role Enum
 */
export enum UserRole {
  ROLE_USER = "ROLE_USER",
  ROLE_ADMIN = "ROLE_ADMIN",
  ROLE_SUPERADMIN = "ROLE_SUPERADMIN",
}

const RoleSchema = z.nativeEnum(UserRole);

const HIERARCHY: Record<UserRole, number> = {
  [UserRole.ROLE_USER]: 1,
  [UserRole.ROLE_ADMIN]: 2,
  [UserRole.ROLE_SUPERADMIN]: 3,
};

/**
 * Role Value Object
 */
export class Role {
  private readonly value: UserRole;

  private constructor(value: UserRole) {
    this.value = value;
  }

  static create(value: string): Role {
    const validated = RoleSchema.parse(value);
    return new Role(validated);
  }

  static fromEnum(value: UserRole): Role {
    return new Role(value);
  }

  static default(): Role {
    return new Role(UserRole.ROLE_USER);
  }

  getValue(): UserRole {
    return this.value;
  }

  getStringValue(): string {
    return this.value;
  }

  isUser(): boolean {
    return this.value === UserRole.ROLE_USER;
  }

  isAdmin(): boolean {
    return this.value === UserRole.ROLE_ADMIN;
  }

  isSuperAdmin(): boolean {
    return this.value === UserRole.ROLE_SUPERADMIN;
  }

  hasAdminPrivileges(): boolean {
    return this.isAdmin() || this.isSuperAdmin();
  }

  hasPrivilegesOf(other: Role): boolean {
    return HIERARCHY[this.value] >= HIERARCHY[other.value];
  }

  equals(other: Role): boolean {
    return this.value === other.value;
  }
}
