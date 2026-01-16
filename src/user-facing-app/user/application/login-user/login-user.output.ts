import { UserRole } from "../../domain/value-objects/role.value-object";

/**
 * Login User Output
 * Returns user information after successful login
 */
export interface LoginUserOutput {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
