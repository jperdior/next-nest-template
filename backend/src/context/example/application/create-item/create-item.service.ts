import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ItemEntity } from '../../domain/entities/item.entity';
import {
  ItemRepositoryInterface,
  ITEM_REPOSITORY,
} from '../../domain/repositories/item.repository.interface';
import { CreateItemInput, CreateItemInputSchema } from './create-item.input';
import { CreateItemOutput } from './create-item.output';

@Injectable()
export class CreateItemService {
  constructor(
    @Inject(ITEM_REPOSITORY)
    private readonly itemRepository: ItemRepositoryInterface
  ) {}

  async execute(input: CreateItemInput): Promise<CreateItemOutput> {
    // Validate input
    const validated = CreateItemInputSchema.parse(input);

    // Create domain entity
    const item = new ItemEntity({
      id: randomUUID(),
      name: validated.name,
      description: validated.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Persist
    const created = await this.itemRepository.create(item);

    // Return output
    return new CreateItemOutput(
      created.getId(),
      created.getName(),
      created.getDescription(),
      created.getCreatedAt(),
      created.getUpdatedAt()
    );
  }
}
