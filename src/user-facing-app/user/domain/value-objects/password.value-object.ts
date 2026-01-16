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
   */
  static async create(plainPassword: string): Promise<Password> {
    PasswordSchema.parse(plainPassword);
    const saltRounds = 10;
    const hashedValue = await bcrypt.hash(plainPassword, saltRounds);
    return new Password(hashedValue);
  }

  /**
   * Create a Password instance from an already hashed password
   */
  static fromHash(hashedPassword: string): Password {
    if (!hashedPassword || hashedPassword.length === 0) {
      throw new Error("Hashed password cannot be empty");
    }
    return new Password(hashedPassword);
  }

  getHashedValue(): string {
    return this.hashedValue;
  }

  async verify(plainPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, this.hashedValue);
    } catch {
      return false;
    }
  }

  static validate(plainPassword: string): void {
    PasswordSchema.parse(plainPassword);
  }

  static isValid(plainPassword: string): boolean {
    try {
      PasswordSchema.parse(plainPassword);
      return true;
    } catch {
      return false;
    }
  }
}
