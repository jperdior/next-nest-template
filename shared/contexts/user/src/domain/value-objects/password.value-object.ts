import * as bcrypt from "bcrypt";
import { z } from "zod";

/**
 * Password validation schema
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[!@#$%^&*(),.?":{}|<>\[\]\/\-_=+`~]/, "Password must contain at least one special character");

/**
 * Password Value Object
 * Encapsulates password hashing and validation logic
 */
export class Password {
  private readonly hashedValue: string;

  private constructor(hashedValue: string) {
    this.hashedValue = hashedValue;
  }

  /**
   * Create a Password from a plain text password
   * Validates and hashes the password
   * @param plainPassword - The plain text password
   * @throws {Error} if password doesn't meet validation requirements
   */
  static async create(plainPassword: string): Promise<Password> {
    // Validate password format
    PasswordSchema.parse(plainPassword);

    // Hash the password
    const saltRounds = 10;
    const hashedValue = await bcrypt.hash(plainPassword, saltRounds);

    return new Password(hashedValue);
  }

  /**
   * Create a Password instance from an already hashed password
   * Use this when loading from database
   * @param hashedPassword - The already hashed password
   */
  static fromHash(hashedPassword: string): Password {
    if (!hashedPassword || hashedPassword.length === 0) {
      throw new Error("Hashed password cannot be empty");
    }
    return new Password(hashedPassword);
  }

  /**
   * Get the hashed password value
   * Use this when persisting to database
   */
  getHashedValue(): string {
    return this.hashedValue;
  }

  /**
   * Verify if a plain text password matches this hashed password
   * @param plainPassword - The plain text password to verify
   * @returns true if the password matches, false otherwise
   */
  async verify(plainPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, this.hashedValue);
    } catch (error) {
      // Log unexpected errors for debugging (without exposing sensitive data)
      console.error('Password verification failed with unexpected error:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  /**
   * Validate a plain text password without creating a Password object
   * Useful for checking password format before creation
   * @param plainPassword - The plain text password to validate
   * @throws {Error} if password doesn't meet requirements
   */
  static validate(plainPassword: string): void {
    PasswordSchema.parse(plainPassword);
  }

  /**
   * Check if a password meets minimum requirements
   * @param plainPassword - The plain text password to check
   * @returns true if valid, false otherwise
   */
  static isValid(plainPassword: string): boolean {
    try {
      PasswordSchema.parse(plainPassword);
      return true;
    } catch {
      return false;
    }
  }
}
