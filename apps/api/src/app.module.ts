import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthClientModule } from '@app/auth-client';
import { ConfigModule } from '@nestjs/config';
import {
  PermissionModule,
  StaffAuthModule,
  StaffModule,
  StaffPositionModule,
  UserModule,
} from './auth';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthClientModule,
    PermissionModule,
    UserModule,
    StaffAuthModule,
    StaffPositionModule,
    StaffModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
