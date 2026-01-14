import { Module } from "@nestjs/common";
import { ItemsController } from "./items.controller";

/**
 * Items HTTP Module
 * 
 * This module provides the HTTP API endpoints for items in the backoffice.
 * It's a thin layer that delegates to the domain use cases from the ExampleContext.
 */
@Module({
  controllers: [ItemsController],
})
export class ItemsModule {}
