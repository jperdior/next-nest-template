'use client';

import { useState } from 'react';
import { CreateItemInput } from '../../domain/value-objects/create-item.input';
import { Item } from '../../domain/entities/item.entity';
import { itemsApiClient } from '../../infrastructure/api/items-api.client';

export function useCreateItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createItem = async (input: CreateItemInput): Promise<Item | null> => {
    try {
      setLoading(true);
      setError(null);
      const item = await itemsApiClient.createItem(input);
      return item;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createItem,
    loading,
    error,
  };
}
