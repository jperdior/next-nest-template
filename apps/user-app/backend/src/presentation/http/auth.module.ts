import { Module } from '@nestjs/common';
import { UserFacingAppUserModule } from '@testproject/user-facing-app-context';
import { JWTService } from '@testproject/auth';
import { AuthController } from './auth.controller';

@Module({
  imports: [UserFacingAppUserModule],
  controllers: [AuthController],
  providers: [JWTService],
})
export class AuthModule {}
