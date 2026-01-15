import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { RegisterUserService } from "@testproject/user-context";
import { RegisterUserDto } from "./dto/register-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly registerUserService: RegisterUserService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "User registered successfully",
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input",
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: "User already exists",
  })
  async register(
    @Body() registerUserDto: RegisterUserDto
  ): Promise<UserResponseDto> {
    const result = await this.registerUserService.execute(registerUserDto);
    return {
      id: result.id,
      email: result.email,
      name: result.name,
      createdAt: result.createdAt,
    };
  }
}
