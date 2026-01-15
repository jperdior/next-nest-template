import { z } from "zod";
import { Email } from "../value-objects/email.value-object";

/**
 * Zod schema for User entity validation
 */
const UserEntitySchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(255),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserEntityProps = z.infer<typeof UserEntitySchema>;

/**
 * User Entity
 * Represents a user in the system
 */
export class UserEntity {
  private readonly id: string;
  private email: Email;
  private name: string;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: UserEntityProps) {
    const validated = UserEntitySchema.parse(props);
    this.id = validated.id;
    this.email = Email.create(validated.email);
    this.name = validated.name;
    this.createdAt = validated.createdAt;
    this.updatedAt = validated.updatedAt;
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getEmail(): Email {
    return this.email;
  }

  getName(): string {
    return this.name;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Business methods
  updateName(name: string): void {
    const validated = z.string().min(1).max(255).parse(name);
    this.name = validated;
    this.updatedAt = new Date();
  }

  updateEmail(email: string): void {
    this.email = Email.create(email);
    this.updatedAt = new Date();
  }

  // Convert to plain object for persistence
  toPlainObject(): UserEntityProps {
    return {
      id: this.id,
      email: this.email.getValue(),
      name: this.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
