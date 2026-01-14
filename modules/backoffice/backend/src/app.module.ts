import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ExampleContextModule } from "@shared/contexts/example/example.module";
import { ItemsModule } from "./presentation/http/items.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ExampleContextModule,
    ItemsModule,
  ],
})
export class AppModule {}
