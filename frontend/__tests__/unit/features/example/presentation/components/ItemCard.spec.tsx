import { render, screen } from '@testing-library/react';
import { ItemCard } from '@/features/example/presentation/components/ItemCard';
import { Item } from '@/features/example/domain/entities/item.entity';

const mockItem: Item = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Test Item',
  description: 'Test Description',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('ItemCard', () => {
  it('renders item name', () => {
    render(<ItemCard item={mockItem} />);
    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  it('renders item description when provided', () => {
    render(<ItemCard item={mockItem} />);
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const itemWithoutDesc = { ...mockItem, description: undefined };
    render(<ItemCard item={itemWithoutDesc} />);
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  it('renders formatted creation date', () => {
    render(<ItemCard item={mockItem} />);
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
  });
});
