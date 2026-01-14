import { z } from 'zod';
import { ItemName } from '../value-objects/item-name.value-object';

export const ItemEntitySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ItemEntityProps = z.infer<typeof ItemEntitySchema>;

export class ItemEntity {
  private readonly id: string;
  private name: ItemName;
  private description?: string;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: ItemEntityProps) {
    const validated = ItemEntitySchema.parse(props);
    this.id = validated.id;
    this.name = ItemName.create(validated.name);
    this.description = validated.description;
    this.createdAt = validated.createdAt;
    this.updatedAt = validated.updatedAt;
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name.getValue();
  }

  getDescription(): string | undefined {
    return this.description;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  updateName(name: string): void {
    this.name = ItemName.create(name);
    this.updatedAt = new Date();
  }

  updateDescription(description: string): void {
    this.description = description;
    this.updatedAt = new Date();
  }

  toPlainObject(): ItemEntityProps {
    return {
      id: this.id,
      name: this.getName(),
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
