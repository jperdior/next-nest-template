import { randomUUID } from "crypto";
import { z } from "zod";

const UuidSchema = z.string().uuid();

/**
 * UUID Value Object
 * 
 * Base value object for all UUID identifiers in the domain.
 * Can be extended for specific entity IDs (UserId, OrderId, etc.)
 */
export class Uuid {
  protected readonly value: string;

  constructor(value: string) {
    this.value = UuidSchema.parse(value);
  }

  static generate(): Uuid {
    return new Uuid(randomUUID());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Uuid): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

/**
 * UserId Value Object
 * Strongly-typed identifier for User aggregates
 */
export class UserId extends Uuid {
  static generate(): UserId {
    return new UserId(randomUUID());
  }

  static fromString(value: string): UserId {
    return new UserId(value);
  }
}
