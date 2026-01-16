import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import {
  RegisterUserService,
  LoginUserService,
  InvalidCredentialsException,
} from '@testproject/user-facing-app-context';
import { JWTService } from '@testproject/shared';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserService: RegisterUserService,
    private readonly loginUserService: LoginUserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JWTService
  ) {}

  /**
   * Build authentication response with JWT token
   * @param user - User data from use case
   * @returns Auth response with token and user info
   */
  private buildAuthResponse(user: {
    id: string;
    email: string;
    name: string;
    role: string;
  }): AuthResponseDto {
    const jwtSecret = this.configService.getOrThrow<string>('JWT_SECRET');
    const jwtExpiration = this.configService.get<string>('JWT_EXPIRATION', '7d');

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

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already exists',
  })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    // Execute registration use case
    const user = await this.registerUserService.execute(dto);

    // Build auth response with JWT token
    return this.buildAuthResponse(user);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    try {
      // Execute login use case
      const user = await this.loginUserService.execute(dto);

      // Build auth response with JWT token
      return this.buildAuthResponse(user);
    } catch (error) {
      // Translate domain exception to HTTP exception
      if (error instanceof InvalidCredentialsException) {
        throw new UnauthorizedException(error.message);
      }
      throw error;
    }
  }
}
