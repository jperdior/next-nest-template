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
# From project root (runs in Docker)
make test-fe            # Run all frontend tests

# From inside frontend container (make shell-fe)
pnpm test               # All tests
pnpm test:watch         # Watch mode
pnpm test:cov           # Coverage
```

**Note:** For quick test runs, use `make test-fe` from the project root. For watch mode, use `make shell-fe` to open a shell in the container.
