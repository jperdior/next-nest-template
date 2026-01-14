import { AuthUser } from './types';

/**
 * Check if user has a specific role
 * 
 * @param user - Auth user object
 * @param role - Role to check
 * @returns True if user has the role
 */
export function hasRole(user: AuthUser, role: string): boolean {
  return user.roles.includes(role);
}

/**
 * Check if user has any of the specified roles
 * 
 * @param user - Auth user object
 * @param roles - Array of roles to check
 * @returns True if user has at least one of the roles
 */
export function hasAnyRole(user: AuthUser, roles: string[]): boolean {
  return roles.some(role => user.roles.includes(role));
}

/**
 * Check if user has all of the specified roles
 * 
 * @param user - Auth user object
 * @param roles - Array of roles to check
 * @returns True if user has all of the roles
 */
export function hasAllRoles(user: AuthUser, roles: string[]): boolean {
  return roles.every(role => user.roles.includes(role));
}

/**
 * Create a role guard function
 * 
 * @param requiredRole - Role required to pass the guard
 * @returns Guard function that checks if user has the required role
 */
export function createRoleGuard(requiredRole: string) {
  return (user: AuthUser | null): boolean => {
    if (!user) {
      return false;
    }
    return hasRole(user, requiredRole);
  };
}

/**
 * Create a multi-role guard function (user must have ANY of the roles)
 * 
 * @param requiredRoles - Array of roles (user needs at least one)
 * @returns Guard function
 */
export function createAnyRoleGuard(requiredRoles: string[]) {
  return (user: AuthUser | null): boolean => {
    if (!user) {
      return false;
    }
    return hasAnyRole(user, requiredRoles);
  };
}

/**
 * Create a multi-role guard function (user must have ALL of the roles)
 * 
 * @param requiredRoles - Array of roles (user needs all)
 * @returns Guard function
 */
export function createAllRolesGuard(requiredRoles: string[]) {
  return (user: AuthUser | null): boolean => {
    if (!user) {
      return false;
    }
    return hasAllRoles(user, requiredRoles);
  };
}
