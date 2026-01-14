# Frontend Testing Guide

## Test Types

- **Component Tests**: UI rendering and interactions
- **Hook Tests**: Custom hook logic
- **Integration Tests**: Page flows with MSW

## Patterns

```typescript
// Component test
describe('ItemCard', () => {
  it('renders item name', () => {
    render(<ItemCard item={mockItem} />);
    expect(screen.getByText('Item Name')).toBeInTheDocument();
  });
});

// Hook test
describe('useItems', () => {
  it('fetches items on mount', async () => {
    const { result } = renderHook(() => useItems());
    await waitFor(() => expect(result.current.items).toHaveLength(3));
  });
});
```

## Run Tests

```bash
pnpm test              # All tests
pnpm test:watch        # Watch mode
pnpm test:cov          # Coverage
```
