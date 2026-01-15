// Module
export { UserContextModule } from "./user-context.module";

// Use cases
export { RegisterUserService } from "./application/register-user/register-user.service";
export { ListUsersService } from "./application/list-users/list-users.service";

// DTOs
export type { RegisterUserInput } from "./application/register-user/register-user.input";
export type { RegisterUserOutput } from "./application/register-user/register-user.output";
export type { ListUsersOutput, UserListItem } from "./application/list-users/list-users.output";

// Domain exports (if needed by modules)
export { UserEntity } from "./domain/entities/user.entity";
export { Email } from "./domain/value-objects/email.value-object";
