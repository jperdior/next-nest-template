'use client';

import { useState } from 'react';
import { useItems } from '../../application/hooks/use-items';
import { ItemCard } from './ItemCard';
import { CreateItemForm } from './CreateItemForm';

export function ItemList() {
  const { items, loading, error, refetch } = useItems();
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = () => {
    setShowForm(false);
    refetch();
  };

  if (loading && items.length === 0) {
    return <div className="text-center py-8">Loading items...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading items: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Items ({items.length})
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : 'Add Item'}
        </button>
      </div>

      {showForm && (
        <div className="border border-border rounded-lg p-4">
          <h4 className="font-semibold mb-4">Create New Item</h4>
          <CreateItemForm onSuccess={handleSuccess} />
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No items yet. Create your first item to get started!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
