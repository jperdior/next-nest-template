import { Module } from '@nestjs/common';
import { BackofficeUserModule } from '@testproject/backoffice-context';
import { UsersController } from './users.controller';

/**
 * Users HTTP Module
 *
 * This module provides the HTTP API endpoints for user management.
 * It's a thin layer that delegates to the User context use cases.
 */
@Module({
  imports: [BackofficeUserModule],
  controllers: [UsersController],
})
export class UsersModule {}
