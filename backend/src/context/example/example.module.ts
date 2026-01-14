import { Module } from "@nestjs/common";
import { DatabaseModule } from "@shared/database/database.module";
import { CreateItemService } from "./application/create-item/create-item.service";
import { GetItemsService } from "./application/get-items/get-items.service";
import { ItemPrismaRepository } from "./infrastructure/persistence/item-prisma.repository";
import { ITEM_REPOSITORY } from "./domain/repositories/item.repository.interface";
import { ItemsController } from "./presentation/http/items.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [ItemsController],
  providers: [
    CreateItemService,
    GetItemsService,
    {
      provide: ITEM_REPOSITORY,
      useClass: ItemPrismaRepository,
    },
  ],
})
export class ExampleModule {}
