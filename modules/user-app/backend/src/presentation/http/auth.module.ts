import { Module } from "@nestjs/common";
import { UserContextModule } from "@testproject/user-context";
import { AuthController } from "./auth.controller";

@Module({
  imports: [UserContextModule],
  controllers: [AuthController],
})
export class AuthModule {}
