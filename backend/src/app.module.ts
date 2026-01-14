import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ExampleModule } from "./context/example/example.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ExampleModule,
  ],
})
export class AppModule {}
