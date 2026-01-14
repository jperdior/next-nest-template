import { Item } from '../../domain/entities/item.entity';

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  const formattedDate = new Date(item.createdAt).toLocaleDateString();

  return (
    <div className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
      {item.description && (
        <p className="text-gray-600 text-sm mb-2">{item.description}</p>
      )}
      <p className="text-xs text-gray-500">Created: {formattedDate}</p>
    </div>
  );
}
