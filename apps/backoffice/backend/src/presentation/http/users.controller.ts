import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ListUsersService } from '@testproject/backoffice-context';
import { UserListResponseDto } from './dto/user-list-response.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly listUsersService: ListUsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all users' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of users',
    type: UserListResponseDto,
  })
  async list(): Promise<UserListResponseDto> {
    const result = await this.listUsersService.execute();
    return {
      users: result.users,
      total: result.total,
    };
  }
}
