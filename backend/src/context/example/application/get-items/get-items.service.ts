import { Inject, Injectable } from '@nestjs/common';
import {
  ItemRepositoryInterface,
  ITEM_REPOSITORY,
} from '../../domain/repositories/item.repository.interface';

export class GetItemsOutput {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}

@Injectable()
export class GetItemsService {
  constructor(
    @Inject(ITEM_REPOSITORY)
    private readonly itemRepository: ItemRepositoryInterface
  ) {}

  async execute(): Promise<GetItemsOutput[]> {
    const items = await this.itemRepository.findAll();

    return items.map(
      (item) =>
        new GetItemsOutput(
          item.getId(),
          item.getName(),
          item.getDescription(),
          item.getCreatedAt(),
          item.getUpdatedAt()
        )
    );
  }
}
