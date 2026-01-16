import { Module } from "@nestjs/common";
import { DatabaseModule } from "@testproject/database";
import { ListUsersService } from "./application/list-users/list-users.service";
import { UserPrismaRepository } from "./infrastructure/persistence/user-prisma.repository";
import { BACKOFFICE_USER_REPOSITORY } from "./domain/user.repository";

/**
 * Backoffice User Module
 * 
 * Provides the User aggregate for the Backoffice bounded context.
 * Contains only admin-related use cases:
 * - ListUsers
 * 
 * This module should be imported by the Backoffice app.
 */
@Module({
  imports: [DatabaseModule],
  providers: [
    // Use cases
    ListUsersService,
    // Repositories
    {
      provide: BACKOFFICE_USER_REPOSITORY,
      useClass: UserPrismaRepository,
    },
  ],
  exports: [ListUsersService],
})
export class BackofficeUserModule {}
