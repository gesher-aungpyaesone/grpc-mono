import { Global, Module } from '@nestjs/common';
import { AuthPrismaService } from './auth-prisma.service';
import { UserService } from './auth/user-prisma.service';
import {
  PermissionService,
  StaffPositionService,
  StaffDepartmentService,
  StaffService,
  StaffPermissionService,
  GroupService,
  GroupPermissionService,
  StaffGroupService,
} from './auth';

@Global()
@Module({
  providers: [
    AuthPrismaService,
    UserService,
    PermissionService,
    StaffPositionService,
    StaffDepartmentService,
    StaffService,
    StaffPermissionService,
    GroupService,
    GroupPermissionService,
    StaffGroupService,
  ],
  exports: [
    AuthPrismaService,
    UserService,
    PermissionService,
    StaffPositionService,
    StaffDepartmentService,
    StaffService,
    StaffPermissionService,
    GroupService,
    GroupPermissionService,
    StaffGroupService,
  ],
})
export class AuthPrismaModule {}
