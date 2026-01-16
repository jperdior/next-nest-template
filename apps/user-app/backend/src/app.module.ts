import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserFacingAppUserModule } from '@testproject/user-facing-app-context';
import { AuthModule } from './presentation/http/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserFacingAppUserModule,
    AuthModule,
  ],
})
export class AppModule {}
