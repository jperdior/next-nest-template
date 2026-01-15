import { Module } from '@nestjs/common';
import { UserContextModule } from '@testproject/user-context';
import { JWTService } from '@testproject/auth';
import { AuthController } from './auth.controller';

@Module({
  imports: [UserContextModule],
  controllers: [AuthController],
  providers: [JWTService],
})
export class AuthModule {}
