import { apiClient } from '@/shared/lib/api-client';
import { Item } from '../../domain/entities/item.entity';
import { CreateItemInput } from '../../domain/value-objects/create-item.input';

export class ItemsApiClient {
  async getItems(): Promise<Item[]> {
    return apiClient<Item[]>('/items');
  }

  async createItem(input: CreateItemInput): Promise<Item> {
    return apiClient<Item>('/items', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }
}

// Singleton instance
export const itemsApiClient = new ItemsApiClient();
