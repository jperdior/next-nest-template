import { z } from 'zod';

const ItemNameSchema = z.string().min(3).max(100);

export class ItemName {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): ItemName {
    const validated = ItemNameSchema.parse(value);
    return new ItemName(validated);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ItemName): boolean {
    return this.value === other.value;
  }
}
