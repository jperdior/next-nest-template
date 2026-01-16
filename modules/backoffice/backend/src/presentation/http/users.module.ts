import { Module } from '@nestjs/common';
import { UserContextModule } from '@testproject/user-context';
import { UsersController } from './users.controller';

/**
 * Users HTTP Module
 *
 * This module provides the HTTP API endpoints for user management.
 * It's a thin layer that delegates to the User context use cases.
 */
@Module({
  imports: [UserContextModule],
  controllers: [UsersController],
})
export class UsersModule {}
