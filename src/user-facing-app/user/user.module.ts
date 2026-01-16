import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "@testproject/database";
import { RegisterUserService } from "./application/register-user/register-user.service";
import { LoginUserService } from "./application/login-user/login-user.service";
import { UserPrismaRepository } from "./infrastructure/persistence/user-prisma.repository";
import { USER_FACING_APP_USER_REPOSITORY } from "./domain/user.repository";

/**
 * UserFacingApp User Module
 * 
 * Provides the User aggregate for the UserFacingApp bounded context.
 * Contains auth-related use cases:
 * - RegisterUser
 * - LoginUser
 * 
 * This module should be imported by the user-app.
 */
@Module({
  imports: [DatabaseModule, ConfigModule],
  providers: [
    // Use cases
    RegisterUserService,
    LoginUserService,
    // Repositories
    {
      provide: USER_FACING_APP_USER_REPOSITORY,
      useClass: UserPrismaRepository,
    },
  ],
  exports: [RegisterUserService, LoginUserService],
})
export class UserFacingAppUserModule {}
