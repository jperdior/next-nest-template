import { Module } from '@nestjs/common';
import { DatabaseModule } from './infrastructure/database/src/database.module';
import { CreateItemService } from './application/create-item/create-item.service';
import { GetItemsService } from './application/get-items/get-items.service';
import { ItemPrismaRepository } from './infrastructure/persistence/item-prisma.repository';
import { ITEM_REPOSITORY } from './domain/repositories/item.repository.interface';

/**
 * Example Bounded Context Module
 * 
 * This module encapsulates the Example bounded context, providing:
 * - Domain entities and value objects
 * - Application use cases (CreateItem, GetItems)
 * - Infrastructure implementations (Prisma repository)
 * 
 * This context can be imported by any module that needs to work with Items.
 */
@Module({
  imports: [DatabaseModule],
  providers: [
    // Use cases
    CreateItemService,
    GetItemsService,
    // Repositories
    {
      provide: ITEM_REPOSITORY,
      useClass: ItemPrismaRepository,
    },
  ],
  exports: [
    // Export use cases for modules to consume
    CreateItemService,
    GetItemsService,
  ],
})
export class ExampleContextModule {}
