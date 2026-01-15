import { Module } from "@nestjs/common";
import { DatabaseModule } from "@testproject/database";
import { RegisterUserService } from "./application/register-user/register-user.service";
import { LoginUserService } from "./application/login-user/login-user.service";
import { ListUsersService } from "./application/list-users/list-users.service";
import { UserPrismaRepository } from "./infrastructure/persistence/user-prisma.repository";
import { USER_REPOSITORY } from "./domain/repositories/user.repository.interface";

/**
 * User Bounded Context Module
 *
 * This module encapsulates the User bounded context, providing:
 * - Domain entities and value objects
 * - Application use cases (RegisterUser, LoginUser, ListUsers)
 * - Infrastructure implementations (Prisma repository)
 *
 * This context can be imported by any module that needs to work with Users.
 */
@Module({
  imports: [DatabaseModule],
  providers: [
    // Use cases
    RegisterUserService,
    LoginUserService,
    ListUsersService,
    // Repositories
    {
      provide: USER_REPOSITORY,
      useClass: UserPrismaRepository,
    },
  ],
  exports: [
    // Export use cases for modules to consume
    RegisterUserService,
    LoginUserService,
    ListUsersService,
  ],
})
export class UserContextModule {}
