import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CreateItemService } from "@shared/contexts/example/application/create-item/create-item.service";
import { GetItemsService } from "@shared/contexts/example/application/get-items/get-items.service";
import { CreateItemDto } from "./dto/create-item.dto";
import { ItemResponseDto } from "./dto/item-response.dto";

@ApiTags("items")
@Controller("items")
export class ItemsController {
  constructor(
    private readonly createItemService: CreateItemService,
    private readonly getItemsService: GetItemsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new item" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Item created successfully",
    type: ItemResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input",
  })
  async create(@Body() createItemDto: CreateItemDto): Promise<ItemResponseDto> {
    const result = await this.createItemService.execute(createItemDto);
    return {
      id: result.id,
      name: result.name,
      description: result.description,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all items" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "List of items",
    type: [ItemResponseDto],
  })
  async findAll(): Promise<ItemResponseDto[]> {
    const items = await this.getItemsService.execute();
    return items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }
}
