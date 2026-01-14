import { ItemEntity } from "@context/example/domain/entities/item.entity";

describe("ItemEntity", () => {
  describe("constructor", () => {
    it("should create item with valid data", () => {
      const props = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Test Item",
        description: "Test Description",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      };

      const item = new ItemEntity(props);

      expect(item.getId()).toBe(props.id);
      expect(item.getName()).toBe(props.name);
      expect(item.getDescription()).toBe(props.description);
      expect(item.getCreatedAt()).toEqual(props.createdAt);
      expect(item.getUpdatedAt()).toEqual(props.updatedAt);
    });

    it("should create item without description", () => {
      const props = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Test Item",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      };

      const item = new ItemEntity(props);

      expect(item.getDescription()).toBeUndefined();
    });

    it("should reject invalid name (too short)", () => {
      const props = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "ab",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => new ItemEntity(props)).toThrow();
    });

    it("should reject invalid UUID", () => {
      const props = {
        id: "invalid-uuid",
        name: "Test Item",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => new ItemEntity(props)).toThrow();
    });
  });

  describe("updateName", () => {
    it("should update name", () => {
      const item = new ItemEntity({
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Original Name",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      });

      item.updateName("New Name");

      expect(item.getName()).toBe("New Name");
    });

    it("should update updatedAt timestamp", () => {
      const originalDate = new Date("2024-01-01");
      const item = new ItemEntity({
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Original Name",
        createdAt: originalDate,
        updatedAt: originalDate,
      });

      jest.useFakeTimers().setSystemTime(new Date("2024-01-02"));
      item.updateName("New Name");

      expect(item.getUpdatedAt()).not.toEqual(originalDate);
      expect(item.getUpdatedAt().getTime()).toBeGreaterThan(
        originalDate.getTime(),
      );

      jest.useRealTimers();
    });

    it("should reject invalid name", () => {
      const item = new ItemEntity({
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Original Name",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(() => item.updateName("ab")).toThrow();
    });
  });

  describe("updateDescription", () => {
    it("should update description", () => {
      const item = new ItemEntity({
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Test Item",
        description: "Original",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      item.updateDescription("Updated Description");

      expect(item.getDescription()).toBe("Updated Description");
    });

    it("should update updatedAt timestamp", () => {
      const originalDate = new Date("2024-01-01");
      const item = new ItemEntity({
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Test Item",
        createdAt: originalDate,
        updatedAt: originalDate,
      });

      jest.useFakeTimers().setSystemTime(new Date("2024-01-02"));
      item.updateDescription("Updated");

      expect(item.getUpdatedAt().getTime()).toBeGreaterThan(
        originalDate.getTime(),
      );

      jest.useRealTimers();
    });
  });

  describe("toPlainObject", () => {
    it("should convert entity to plain object", () => {
      const props = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Test Item",
        description: "Test Description",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      };

      const item = new ItemEntity(props);
      const plainObject = item.toPlainObject();

      expect(plainObject).toEqual(props);
    });
  });
});
