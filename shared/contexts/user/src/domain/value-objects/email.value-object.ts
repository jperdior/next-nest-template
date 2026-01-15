import { z } from "zod";

const EmailSchema = z.string().email("Invalid email format");

/**
 * Email Value Object
 * Ensures email format is valid
 */
export class Email {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(email: string): Email {
    const validated = EmailSchema.parse(email.toLowerCase().trim());
    return new Email(validated);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
