/**
 * Register User Output
 * Returns user information after successful registration
 */
export interface RegisterUserOutput {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
}
