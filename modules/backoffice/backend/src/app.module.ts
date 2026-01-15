import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UserContextModule } from "@testproject/user-context";
import { UsersModule } from "./presentation/http/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserContextModule,
    UsersModule,
  ],
})
export class AppModule {}
