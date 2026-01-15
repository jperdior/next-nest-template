import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import {
  RegisterUserService,
  LoginUserService,
} from "@testproject/user-context";
import { JWTService } from "@testproject/auth";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  private readonly jwtService: JWTService;

  constructor(
    private readonly registerUserService: RegisterUserService,
    private readonly loginUserService: LoginUserService,
    private readonly configService: ConfigService
  ) {
    this.jwtService = new JWTService();
  }

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "User registered successfully",
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input",
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: "Email already exists",
  })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    // Execute registration use case
    const user = await this.registerUserService.execute(dto);

    // Generate JWT token
    const jwtSecret = this.configService.get<string>("JWT_SECRET") || 'dev-secret';
    const jwtExpiration = this.configService.get<string>("JWT_EXPIRATION", "7d");
    
    const accessToken = this.jwtService.generateAccessToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      jwtExpiration
    );

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login with email and password" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Login successful",
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input",
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Invalid credentials",
  })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    // Execute login use case
    const user = await this.loginUserService.execute(dto);

    // Generate JWT token
    const jwtSecret = this.configService.get<string>("JWT_SECRET") || 'dev-secret';
    const jwtExpiration = this.configService.get<string>("JWT_EXPIRATION", "7d");
    
    const accessToken = this.jwtService.generateAccessToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      jwtExpiration
    );

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
