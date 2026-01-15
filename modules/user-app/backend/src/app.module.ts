import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UserContextModule } from "@testproject/user-context";
import { AuthModule } from "./presentation/http/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserContextModule,
    AuthModule,
  ],
})
export class AppModule {}
