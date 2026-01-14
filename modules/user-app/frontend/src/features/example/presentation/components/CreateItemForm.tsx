'use client';

import { useState, FormEvent } from 'react';
import { useCreateItem } from '../../application/hooks/use-create-item';

interface CreateItemFormProps {
  onSuccess?: () => void;
}

export function CreateItemForm({ onSuccess }: CreateItemFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { createItem, loading, error } = useCreateItem();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const input = {
      name,
      description: description || undefined,
    };

    const item = await createItem(input);
    if (item) {
      setName('');
      setDescription('');
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Item name"
          required
          minLength={3}
          maxLength={100}
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Item description (optional)"
          rows={3}
          disabled={loading}
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">
          Error: {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Creating...' : 'Create Item'}
      </button>
    </form>
  );
}
