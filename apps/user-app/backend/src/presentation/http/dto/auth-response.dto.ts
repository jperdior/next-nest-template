import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@testproject/user-facing-app-context';

/**
 * Authentication User response data
 */
export class AuthUserResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID',
  })
  id: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email',
  })
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User name',
  })
  name: string;

  @ApiProperty({
    example: 'ROLE_USER',
    description: 'User role',
    enum: Object.values(UserRole),
  })
  role: string;
}

/**
 * Authentication Response DTO
 * Returns JWT token and user information
 */
export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  accessToken: string;

  @ApiProperty({
    type: AuthUserResponseDto,
    description: 'User information',
  })
  user: AuthUserResponseDto;
}
