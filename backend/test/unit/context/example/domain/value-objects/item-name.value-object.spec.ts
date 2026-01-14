import { ItemName } from '@context/example/domain/value-objects/item-name.value-object';

describe('ItemName Value Object', () => {
  describe('create', () => {
    it('should create valid item name', () => {
      const name = ItemName.create('Valid Name');

      expect(name.getValue()).toBe('Valid Name');
    });

    it('should reject name shorter than 3 characters', () => {
      expect(() => ItemName.create('ab')).toThrow();
    });

    it('should reject name longer than 100 characters', () => {
      const longName = 'a'.repeat(101);
      expect(() => ItemName.create(longName)).toThrow();
    });

    it('should accept name with 3 characters', () => {
      const name = ItemName.create('abc');

      expect(name.getValue()).toBe('abc');
    });

    it('should accept name with 100 characters', () => {
      const maxName = 'a'.repeat(100);
      const name = ItemName.create(maxName);

      expect(name.getValue()).toBe(maxName);
    });
  });

  describe('equals', () => {
    it('should return true for same value', () => {
      const name1 = ItemName.create('Test');
      const name2 = ItemName.create('Test');

      expect(name1.equals(name2)).toBe(true);
    });

    it('should return false for different values', () => {
      const name1 = ItemName.create('Test1');
      const name2 = ItemName.create('Test2');

      expect(name1.equals(name2)).toBe(false);
    });
  });

  describe('getValue', () => {
    it('should return the name value', () => {
      const name = ItemName.create('My Item');

      expect(name.getValue()).toBe('My Item');
    });
  });
});
