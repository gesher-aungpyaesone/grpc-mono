import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { StaffModule } from './staff/staff.module';
import { StaffPositionModule } from './staff-position/staff-position.module';
import { StaffAuthModule } from './staff-auth/staff-auth.module';
import { UserModule } from './user/user.module';
import { PermissionModule } from './permission/permission.module';
import { StaffPermissionModule } from './staff-permission/staff-permission.module';
import { GroupModule } from './group/group.module';
import { GroupPermissionModule } from './group-permission/group-permission.module';
import { StaffGroupModule } from './staff-group/staff-group.module';
import { StaffDepartmentModule } from './staff-department/staff-department.module';
import { AuthPrismaModule } from '@app/auth-prisma';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthPrismaModule,
    StaffModule,
    StaffPositionModule,
    StaffDepartmentModule,
    StaffAuthModule,
    UserModule,
    PermissionModule,
    StaffPermissionModule,
    GroupModule,
    GroupPermissionModule,
    StaffGroupModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
