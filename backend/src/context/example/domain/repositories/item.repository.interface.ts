import { ItemEntity } from "../entities/item.entity";

export interface ItemRepositoryInterface {
  create(item: ItemEntity): Promise<ItemEntity>;
  findById(id: string): Promise<ItemEntity | null>;
  findAll(): Promise<ItemEntity[]>;
  update(item: ItemEntity): Promise<ItemEntity>;
  delete(id: string): Promise<void>;
}

export const ITEM_REPOSITORY = Symbol("ITEM_REPOSITORY");
