import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateItemDto {
  @ApiProperty({
    description: 'Item name',
    example: 'My Item',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Item description',
    example: 'This is a sample item',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
