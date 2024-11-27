import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { StaffModule } from './staff/staff.module';
import { PrismaModule } from '@app/prisma';
import { StaffPositionModule } from './staff-position/staff-position.module';
import { StaffAuthModule } from './staff-auth/staff-auth.module';
import { UserModule } from './user/user.module';
import { PermissionModule } from './permission/permission.module';
import { StaffPermissionModule } from './staff-permission/staff-permission.module';
import { GroupModule } from './group/group.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    StaffModule,
    StaffPositionModule,
    StaffAuthModule,
    UserModule,
    PermissionModule,
    StaffPermissionModule,
    GroupModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
