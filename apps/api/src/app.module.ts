import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthClientModule } from '@app/auth-client';
import { ConfigModule } from '@nestjs/config';
import {
  GroupModule,
  GroupPermissionModule,
  PermissionModule,
  StaffAuthModule,
  StaffGroupModule,
  StaffModule,
  StaffPermissionModule,
  StaffPositionModule,
  StaffDepartmentModule,
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
    StaffDepartmentModule,
    StaffModule,
    StaffPermissionModule,
    GroupModule,
    GroupPermissionModule,
    StaffGroupModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
