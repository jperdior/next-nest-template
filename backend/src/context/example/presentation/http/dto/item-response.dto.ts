import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ItemResponseDto {
  @ApiProperty({
    description: "Item ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string;

  @ApiProperty({
    description: "Item name",
    example: "My Item",
  })
  name: string;

  @ApiPropertyOptional({
    description: "Item description",
    example: "This is a sample item",
  })
  description?: string;

  @ApiProperty({
    description: "Creation timestamp",
    example: "2024-01-01T00:00:00.000Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Last update timestamp",
    example: "2024-01-01T00:00:00.000Z",
  })
  updatedAt: Date;
}
