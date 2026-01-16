import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BackofficeUserModule } from '@testproject/backoffice-context';
import { UsersModule } from './presentation/http/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BackofficeUserModule,
    UsersModule,
  ],
})
export class AppModule {}
